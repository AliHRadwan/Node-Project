import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cart, CartItem } from '../../../core/models/cart.model';
import { Subscription } from 'rxjs';
import { CartOrders, PlaceOrderBody } from '../cart-orders';
import { CartService } from '../../../core/services/cart.service';
import { Profileservice } from '../../account/ProfileService/profileservice';
import { ToastService } from '../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

declare const bootstrap: any;

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit, OnDestroy {

  cart: Cart | null = null;
  loading = false;

  lastOrder: any = null;
  couponCode = '';

  addresses: any[] = [];
  selectedAddressIndex: number = -1;
  showNewAddressForm = false;
  addressError = '';
  newAddressForm: FormGroup;
  isAddingAddress = false;

  readonly governorates: string[] = [
    'Cairo', 'Giza', 'Alexandria', 'Port Said', 'Suez', 'Dakahlia', 'Sharqia',
    'Qalyubia', 'Kafr El-Sheikh', 'Gharbia', 'Monufia', 'Beheira', 'Damietta',
    'Ismailia', 'Faiyum', 'Beni Suef', 'Minya', 'Assiut', 'Sohag', 'Qena',
    'Aswan', 'Luxor', 'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai'
  ];
  readonly governorateOtherValue = '__OTHER__';

  /** Shipping zones (lowercase) – must match backend orderController.js */
  private readonly zoneD = ['cairo', 'giza', 'qalyubia'];
  private readonly zoneA = ['alexandria', 'beheira', 'gharbia', 'monufia', 'kafr el-sheikh', 'damietta', 'dakahlia', 'sharqia', 'ismailia', 'port said', 'suez'];
  private readonly zoneB = ['faiyum', 'beni suef', 'minya', 'assiut', 'sohag', 'qena', 'luxor', 'aswan', 'red sea', 'new valley', 'matrouh'];
  private readonly zoneC = ['north sinai', 'south sinai'];

  checkoutLoading = false;
  private sub?: Subscription;

  constructor(
    private cartService: CartService,
    private cartOrders: CartOrders,
    private profileService: Profileservice,
    private toastService: ToastService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.newAddressForm = this.fb.group({
      label: ['', Validators.required],
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      stateDropdown: ['', Validators.required],
      stateCustom: [''],
      country: ['Egypt', Validators.required],
      postalCode: [''],
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  loadCart() {
    this.loading = true;
    this.sub = this.cartService.getCart().subscribe({
      next: res => {
        this.cart = res.data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.toastService.error(err.error?.message || 'Failed to load cart');
      }
    });
  }

  loadAddresses() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.addresses = res.user?.addresses || [];
        const defaultIdx = this.addresses.findIndex((a: any) => a.isDefault);
        if (defaultIdx !== -1) {
          this.selectedAddressIndex = defaultIdx;
        } else if (this.addresses.length > 0) {
          this.selectedAddressIndex = 0;
        }
      },
      error: () => {
        this.addresses = [];
      }
    });
  }

  get cartItems(): CartItem[] {
    return this.cart?.items || [];
  }

  get isEmpty(): boolean {
    return !this.cart || !this.cart.items || this.cart.items.length === 0;
  }

  get subtotal(): number {
    return this.cart?.totals.subTotal || 0;
  }

  /** Selected address state and country (for shipping calculation). */
  get selectedAddressState(): string {
    const addr = this.selectedAddressIndex >= 0 && this.addresses[this.selectedAddressIndex]
      ? this.addresses[this.selectedAddressIndex]
      : null;
    return (addr?.state || addr?.governorate || '').toString().trim().toLowerCase();
  }

  get selectedAddressCountry(): string {
    const addr = this.selectedAddressIndex >= 0 && this.addresses[this.selectedAddressIndex]
      ? this.addresses[this.selectedAddressIndex]
      : null;
    return (addr?.country || '').toString().trim().toLowerCase();
  }

  /** Shipping cost – same logic as backend orderController.js */
  get shippingCost(): number {
    const stateNorm = this.selectedAddressState;
    const countryNorm = this.selectedAddressCountry;
    const itemsTotal = this.subtotal;

    let cost = 30;
    if (countryNorm !== 'egypt') {
      cost = 1000;
    } else if (this.zoneD.includes(stateNorm)) {
      cost = 30;
    } else if (this.zoneA.includes(stateNorm)) {
      cost = 50;
    } else if (this.zoneB.includes(stateNorm)) {
      cost = 70;
    } else if (this.zoneC.includes(stateNorm)) {
      cost = 100;
    } else {
      cost = 70;
    }
    if (itemsTotal > 2000) cost = 0;
    return cost;
  }

  /** Coupon discount – same logic as backend (BOOK10: 10% cap 200 EGP when subtotal > 1000). */
  get couponDiscount(): number {
    const code = (this.couponCode || '').trim();
    const itemsTotal = this.subtotal;
    if (code !== 'BOOK10' || itemsTotal <= 1000) return 0;
    const tenPercent = itemsTotal * 0.1;
    return tenPercent > 200 ? 200 : tenPercent;
  }

  /** Order total in modal: subtotal + shipping - discount. */
  get orderTotal(): number {
    return this.subtotal + this.shippingCost - this.couponDiscount;
  }

  selectAddress(index: number) {
    this.selectedAddressIndex = index;
    this.addressError = '';
  }

  toggleNewAddressForm() {
    this.showNewAddressForm = !this.showNewAddressForm;
    if (this.showNewAddressForm) {
      this.newAddressForm.reset({
        label: '', fullName: '', phone: '', line1: '', line2: '',
        city: '', stateDropdown: '', stateCustom: '', country: 'Egypt', postalCode: ''
      });
    } else {
      this.newAddressForm.reset();
    }
  }

  addNewAddress() {
    const f = this.newAddressForm;
    if (!f.get('stateDropdown')?.value) {
      f.markAllAsTouched();
      return;
    }
    if (f.get('stateDropdown')?.value === this.governorateOtherValue) {
      const custom = (f.get('stateCustom')?.value || '').trim();
      if (!custom) {
        f.get('stateCustom')?.setErrors({ required: true });
        f.markAllAsTouched();
        return;
      }
    }
    if (!f.valid) {
      f.markAllAsTouched();
      return;
    }

    this.isAddingAddress = true;
    const v = f.value;
    const state = v.stateDropdown === this.governorateOtherValue
      ? (v.stateCustom || '').trim()
      : (v.stateDropdown || '');
    const addressData = {
      label: v.label,
      fullName: v.fullName,
      phone: v.phone,
      line1: v.line1,
      line2: v.line2 || undefined,
      city: v.city,
      state,
      country: (v.country || '').trim() || 'Egypt',
      postalCode: (v.postalCode || '').trim() || undefined
    };

    this.profileService.addAddress(addressData).subscribe({
      next: () => {
        this.isAddingAddress = false;
        this.showNewAddressForm = false;
        this.newAddressForm.reset();
        this.toastService.success('Address added successfully');
        this.profileService.getProfile().subscribe({
          next: (res) => {
            this.addresses = res.user?.addresses || [];
            this.selectedAddressIndex = this.addresses.length - 1;
            this.addressError = '';
          }
        });
      },
      error: (err) => {
        this.isAddingAddress = false;
        this.toastService.error(err.error?.error || err.error?.message || 'Failed to add address');
      }
    });
  }

  openCheckoutModal() {
    if (this.isEmpty) return;

    this.addressError = '';
    this.lastOrder = null;

    const modalEl = document.getElementById('paymentConfirmModal');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  confirmAndPay() {
    if (this.selectedAddressIndex < 0 || !this.addresses[this.selectedAddressIndex]) {
      this.addressError = 'Please select a shipping address or add a new one.';
      return;
    }

    this.addressError = '';
    this.checkoutLoading = true;

    const addr = this.addresses[this.selectedAddressIndex];
    const body: PlaceOrderBody = {
      shippingAddress: {
        fullName: addr.fullName,
        phone: addr.phone,
        city: addr.city,
        country: addr.country,
        line1: addr.line1,
        line2: addr.line2 || undefined,
        postalCode: addr.postalCode,
      }
    };

    if (this.couponCode.trim()) {
      body.payment = { couponCode: this.couponCode.trim() } as any;
    }

    this.cartOrders.placeOrder(body).subscribe({
      next: (res: any) => {
        this.lastOrder = res.order;
        try { localStorage.setItem('lastOrder', JSON.stringify(res.order)); } catch {}

        this.cartOrders.createCheckout(res.order._id).subscribe({
          next: (chk: any) => {
            this.checkoutLoading = false;
            const url = chk.url || chk.checkoutUrl || '';
            if (url) {
              window.location.href = url;
            } else {
              this.toastService.error('Payment URL not found from server.');
            }
          },
          error: (err) => {
            this.checkoutLoading = false;
            this.toastService.error(err.error?.message || 'Failed to start payment session.');
          }
        });
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.toastService.error(err.error?.message || 'Failed to place order.');
      }
    });
  }

  cancelCurrentOrder() {
    if (!this.lastOrder?._id || this.checkoutLoading) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Order',
        message: 'Are you sure you want to cancel this order?',
        confirmText: 'Yes, Cancel',
        cancelText: 'No, Keep Order'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.checkoutLoading = true;

        this.cartOrders.cancelOrder(this.lastOrder._id).subscribe({
          next: () => {
            this.checkoutLoading = false;
            try { localStorage.removeItem('lastOrder'); } catch {}
            this.lastOrder = null;
            this.toastService.success('Order cancelled successfully.');

            const modalEl = document.getElementById('paymentConfirmModal');
            if (modalEl) {
              const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
              modal.hide();
            }
            this.loadCart();
          },
          error: (err) => {
            this.checkoutLoading = false;
            this.toastService.error(err.error?.message || 'Failed to cancel order.');
          }
        });
      }
    });
  }
}
