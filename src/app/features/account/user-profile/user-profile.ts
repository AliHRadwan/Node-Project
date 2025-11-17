import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Profileservice } from '../ProfileService/profileservice';
// import { Loginservice } from '../loginService/loginservice';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
})
export class UserProfile implements OnInit, OnDestroy {
  profileForm: FormGroup;          
  deleteForm: FormGroup;            
  addressForm: FormGroup;         
  editAddressForm: FormGroup;     
  passwordForm: FormGroup;         
  fieldForms: { [key: string]: FormGroup } = {}; 

  isLoading = false;              
  isDeleting = false;              
  isAddingAddress = false;        
  isUpdatingAddress = false;       
  isDeletingAddress = false;     
  isChangingPassword = false;       

  message = '';                 
  isError = false;               

  user: any = null;             

  isEditMode = false;             
  activeSection: string = 'profile'; 
  editingField: string | null = null; 

  showDeleteConfirm = false;       
  showAddAddressForm = false;     
  showDeleteAddressConfirm = false; 
  showChangePasswordForm = false;  

  editingAddressId: string | null = null;  
  addressIdToDelete: string | null = null;  

  private messageTimer: any = null;


  constructor(
    private fb: FormBuilder,         
    private profileService: Profileservice,
    //private loginService: Loginservice,    
    private router: Router                
  ) {
    this.profileForm = this.fb.group({
      FirstName: ['', [Validators.required]], 
      LastName: ['', [Validators.required]],   
      email: ['', [Validators.required, Validators.email]] 
    });

    this.deleteForm = this.fb.group({
      password: ['', [Validators.required]] 
    });

    // إنشاء نماذج العناوين
    this.addressForm = this.createAddressForm();     
    this.editAddressForm = this.createAddressForm();

    const passwordValidator = (control: any) => {
      if (!control.value) return null;
      const value = control.value;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasMinLength = value.length >= 8;
      return (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) 
        ? { invalidPassword: true } 
        : null;
    };
    
    this.passwordForm = this.fb.group({
      old_password: ['', [Validators.required]],       
      new_password: ['', [Validators.required, passwordValidator]], 
      confirm_password: ['', [Validators.required]]     
    }, { validators: this.passwordMatchValidator.bind(this) }); 

    this.fieldForms['FirstName'] = this.fb.group({
      FirstName: ['', [Validators.required]]
    });
    this.fieldForms['LastName'] = this.fb.group({
      LastName: ['', [Validators.required]]
    });
    this.fieldForms['email'] = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

 
  private createAddressForm(): FormGroup {
    return this.fb.group({
      label: ['', [Validators.required]],       
      fullName: ['', [Validators.required]],     
      phone: ['', [Validators.required]],       
      line1: ['', [Validators.required]],       
      line2: [''],                               
      city: ['', [Validators.required]],        
      state: ['', [Validators.required]],       
      country: ['', [Validators.required]],     
      postalCode: ['', [Validators.required]],  
      isDefault: [false]                         
    });
  }


  private validatePasswordStrength(control: any) {
    if (!control.value) return null;
    
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);  
    const hasLowerCase = /[a-z]/.test(value); 
    const hasNumber = /\d/.test(value);        
    const hasMinLength = value.length >= 8;     
    
    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      return { invalidPassword: true };
    }
    
    return null; 
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.clearMessageTimer();
  }
  
  loadProfile() {
    if (!this.loginService.isLoggedIn()) {
      this.router.navigate(['/features/login']);
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user; 
        
        this.profileForm.patchValue({
          FirstName: res.user.FirstName,
          LastName: res.user.LastName,
          email: res.user.email
        });
        
        this.isLoading = false; 
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل تحميل الملف الشخصي';
        this.isError = true;
        this.isLoading = false;
        this.startAutoCloseTimer();
        
        if (err.status === 401) {
          setTimeout(() => {
            this.loginService.logout();
            this.router.navigate(['/features/login']);
          }, 2000);
        }
      }
    });
  }

  toggleEditMode() {
    if (this.isEditMode) {
      this.profileForm.patchValue({
        FirstName: this.user.FirstName,
        LastName: this.user.LastName,
        email: this.user.email
      });
    }
    this.isEditMode = !this.isEditMode;
  }

  startEditField(fieldName: string) {
    this.editingField = fieldName; 
    const currentValue = this.user[fieldName]; 
    this.fieldForms[fieldName].patchValue({ [fieldName]: currentValue });
  }

  cancelEditField() {
    this.editingField = null; 
  }

  saveField(fieldName: string) {
    const form = this.fieldForms[fieldName];
    
    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    const newValue = form.get(fieldName)?.value;
    
    if (newValue === this.user[fieldName]) {
      this.editingField = null;
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.profileService.updateProfile({ [fieldName]: newValue }).subscribe({
      next: (res) => {
        if (res.user) {
          this.user = { ...this.user, ...res.user };
        }
        
        this.message = res.message || `تم تحديث ${fieldName} بنجاح`;
        this.isError = false;
        this.isLoading = false;
        this.startAutoCloseTimer();
        
        this.editingField = null; 
        
        if (fieldName === 'email') {
          setTimeout(() => {
            this.loginService.logout();
            this.router.navigate(['/features/login']);
          }, 2000);
        }
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || `فشل تحديث ${fieldName}`;
        this.isError = true;
        this.isLoading = false;
        this.startAutoCloseTimer();
      }
    });
  }

  onUpdateProfile() {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formData = this.profileForm.value;
    const updateData: any = {};

    if (formData.FirstName !== this.user.FirstName) {
      updateData.FirstName = formData.FirstName;
    }
    if (formData.LastName !== this.user.LastName) {
      updateData.LastName = formData.LastName;
    }
    if (formData.email !== this.user.email) {
      updateData.email = formData.email;
    }

    if (Object.keys(updateData).length === 0) {
      this.message = 'لم يتم اكتشاف أي تغييرات';
      this.isError = true;
      this.startAutoCloseTimer();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.profileService.updateProfile(updateData).subscribe({
      next: (res) => {
        if (res.user) {
          this.user = { ...this.user, ...res.user };
        }
        
        this.message = res.message || 'تم تحديث الملف الشخصي بنجاح';
        this.isError = false;
        this.isLoading = false;
        this.startAutoCloseTimer();
        
        this.isEditMode = false; 
        
        if (updateData.email) {
          setTimeout(() => {
            this.loginService.logout();
            this.router.navigate(['/features/login']);
          }, 2000);
        }
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل تحديث الملف الشخصي';
        this.isError = true;
        this.isLoading = false;
        this.startAutoCloseTimer();
      }
    });
  }

  showDeleteConfirmation() {
    this.showDeleteConfirm = true; 
    this.deleteForm.reset(); 
  }

  cancelDelete() {
    this.showDeleteConfirm = false; 
    this.deleteForm.reset(); 
  }

  onDeleteAccount() {
    if (!this.deleteForm.valid) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    this.isDeleting = true;
    this.message = '';
    this.isError = false;
    const password = this.deleteForm.get('password')?.value;

    this.profileService.deleteAccount(password).subscribe({
      next: (res) => {
        this.message = res.message || 'تم حذف الحساب بنجاح';
        this.isError = false;
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.startAutoCloseTimer();
        
        setTimeout(() => {
          this.loginService.logout();
          this.router.navigate(['/features/login']);
        }, 2000);
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل حذف الحساب';
        this.isError = true;
        this.isDeleting = false;
        this.startAutoCloseTimer();
      }
    });
  }

  closeMessage() {
    this.clearMessageTimer(); 
    this.message = ''; 
    this.isError = false; 
    this.isLoading = false; 
  }

  private clearMessageTimer() {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer); 
      this.messageTimer = null; 
    }
  }

  private startAutoCloseTimer() {
    this.clearMessageTimer(); 
    
    if (this.message && !this.isLoading) {
      this.messageTimer = setTimeout(() => {
        this.closeMessage(); 
      }, 4000);
    }
  }

  logout() {
    this.loginService.logout(); 
    this.router.navigate(['/features/login']); 
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  passwordMatchValidator(form: FormGroup): any {
    const newPassword = form.get('new_password'); 
    const confirmPassword = form.get('confirm_password'); 
    
    if (!newPassword || !confirmPassword) return null; 
    
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true }); 
      return { passwordMismatch: true };
    }
    
    confirmPassword.setErrors(null);
    return null;
  }

  showChangePassword() {
    this.showChangePasswordForm = true; 
    this.passwordForm.reset(); 
  }

  cancelChangePassword() {
    this.showChangePasswordForm = false; 
    this.passwordForm.reset(); 
  }

  onChangePassword() {
    if (!this.passwordForm.valid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    this.message = '';
    this.isError = false;

    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.message = res.message || 'تم تغيير كلمة المرور بنجاح';
        this.isError = false;
        this.isChangingPassword = false;
        this.showChangePasswordForm = false;
        this.passwordForm.reset();
        this.startAutoCloseTimer();
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل تغيير كلمة المرور';
        this.isError = true;
        this.isChangingPassword = false;
        this.startAutoCloseTimer();
      }
    });
  }

  showAddAddress() {
    this.showAddAddressForm = true; 
    this.addressForm.reset(); 
    this.addressForm.patchValue({ isDefault: false }); 
  }

  cancelAddAddress() {
    this.showAddAddressForm = false; 
    this.addressForm.reset(); 
  }

  onAddAddress() {
    if (!this.addressForm.valid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isAddingAddress = true;
    this.message = '';
    this.isError = false;
    const addressData = this.buildAddressData(this.addressForm.value);

    this.profileService.addAddress(addressData).subscribe({
      next: (res) => {
        this.message = res.message || 'تم إضافة العنوان بنجاح';
        this.isError = false;
        this.isAddingAddress = false;
        this.showAddAddressForm = false;
        this.addressForm.reset();
        this.startAutoCloseTimer();
        
        this.loadProfile();
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل إضافة العنوان';
        this.isError = true;
        this.isAddingAddress = false;
        this.startAutoCloseTimer();
      }
    });
  }

  showEditAddress(index: number) {
    const address = this.user.addresses[index]; 
    this.editingAddressId = address._id || address.id || index.toString();
    
    this.editAddressForm.patchValue({
      label: address.label || '',
      fullName: address.fullName || '',
      phone: address.phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      postalCode: address.postalCode || '',
      isDefault: address.isDefault || false
    });
  }

  cancelEditAddress() {
    this.editingAddressId = null; 
    this.editAddressForm.reset(); 
  }

  onUpdateAddress() {
    if (!this.editAddressForm.valid || !this.editingAddressId) {
      this.editAddressForm.markAllAsTouched();
      return;
    }

    this.isUpdatingAddress = true;
    this.message = '';
    this.isError = false;
    const addressData = this.buildAddressData(this.editAddressForm.value);
    
    const addressIndex = this.user.addresses.findIndex((addr: any) => 
      addr._id === this.editingAddressId || addr.id === this.editingAddressId
    );
    
    if (addressIndex !== -1) {
      addressData.addressIndex = addressIndex;
    }
    if (typeof this.editingAddressId === 'string' && this.editingAddressId !== addressIndex.toString()) {
      addressData.addressId = this.editingAddressId;
    }

    this.profileService.updateAddress(addressData).subscribe({
      next: (res) => {
        this.message = res.message || 'تم تحديث العنوان بنجاح';
        this.isError = false;
        this.isUpdatingAddress = false;
        this.editingAddressId = null;
        this.editAddressForm.reset();
        this.startAutoCloseTimer();
        
        this.loadProfile();
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل تحديث العنوان';
        this.isError = true;
        this.isUpdatingAddress = false;
        this.startAutoCloseTimer();
      }
    });
  }

  showDeleteAddressModal(index: number) {
    const address = this.user.addresses[index]; 
    this.addressIdToDelete = address._id || address.id || index.toString();
    this.showDeleteAddressConfirm = true; 
  }

  cancelDeleteAddress() {
    this.addressIdToDelete = null; 
    this.showDeleteAddressConfirm = false; 
  }

  onDeleteAddress() {
    if (!this.addressIdToDelete) return;

    this.isDeletingAddress = true;
    this.message = '';
    this.isError = false;
    
    const addressIndex = this.user.addresses.findIndex((addr: any) => 
      addr._id === this.addressIdToDelete || addr.id === this.addressIdToDelete
    );

    const addressData: any = {};
    if (addressIndex !== -1) {
      addressData.addressIndex = addressIndex;
    }
    if (typeof this.addressIdToDelete === 'string' && this.addressIdToDelete !== addressIndex.toString()) {
      addressData.addressId = this.addressIdToDelete;
    }

    this.profileService.deleteAddress(addressData).subscribe({
      next: (res) => {
        this.message = res.message || 'تم حذف العنوان بنجاح';
        this.isError = false;
        this.isDeletingAddress = false;
        this.showDeleteAddressConfirm = false;
        this.addressIdToDelete = null;
        this.startAutoCloseTimer();
        
        this.loadProfile();
      },
      error: (err) => {
        this.message = err?.error?.error || err?.message || 'فشل حذف العنوان';
        this.isError = true;
        this.isDeletingAddress = false;
        this.startAutoCloseTimer();
      }
    });
  }

  private buildAddressData(formData: any): any {
    const addressData: any = {
      label: formData.label?.trim() || '',        
      fullName: formData.fullName?.trim() || '',  
      phone: formData.phone?.trim() || '',        
      line1: formData.line1?.trim() || '',        
      city: formData.city?.trim() || '',          
      state: formData.state?.trim() || '',        
      country: formData.country?.trim() || '',    
      postalCode: formData.postalCode?.trim() || '', 
      isDefault: formData.isDefault || false       
    };
    
    if (formData.line2?.trim()) {
      addressData.line2 = formData.line2.trim();
    }
    
    return addressData;
  }

}
