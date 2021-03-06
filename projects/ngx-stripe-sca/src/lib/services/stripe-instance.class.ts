import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import { WindowRef } from './window-ref.service';
import { LazyStripeAPILoader, Status } from './api-loader.service';

import { StripeJS, Options } from '../interfaces/stripe';
import { Element } from '../interfaces/element';
import { Elements, ElementsOptions } from '../interfaces/elements';
import {
  SourceData,
  SourceResult,
  isSourceData,
  SourceParams
} from '../interfaces/sources';
import {
  CardDataOptions,
  TokenResult,
  Account,
  AccountData,
  BankAccount,
  BankAccountData,
  PiiData,
  Pii,
  isAccount,
  isAccountData,
  isBankAccount,
  isBankAccountData,
  isPii,
  isPiiData
} from '../interfaces/token';
import { StripeServiceInterface } from './stripe-instance.interface';
import { PaymentRequestOptions } from '../interfaces/payment-request';

export class StripeInstance implements StripeServiceInterface {
  private stripe$: BehaviorSubject<StripeJS | undefined> = new BehaviorSubject<
    StripeJS | undefined
  >(undefined);

  constructor(
    public loader: LazyStripeAPILoader,
    public window: WindowRef,
    public key: string,
    public options?: Options
  ) {
    this.loader
      .asStream()
      .pipe(
        filter((status: Status) => status.loaded === true),
        first(),
        map(() => (this.window.getNativeWindow() as any).Stripe)
      )
      .subscribe((Stripe: any) => {
        const stripe = this.options
          ? (Stripe(this.key, this.options) as StripeJS)
          : (Stripe(this.key) as StripeJS);

        this.stripe$.next(stripe);
      });
  }

  public getInstance(): StripeJS | undefined {
    return this.stripe$.getValue();
  }

  public elements(options?: ElementsOptions): Observable<Elements> {
    return this.stripe$.asObservable().pipe(
      filter(stripe => Boolean(stripe)),
      map(stripe => (stripe as StripeJS).elements(options)),
      first()
    );
  }

  public createToken(
    a: Element | Account | BankAccount | Pii,
    b: CardDataOptions | AccountData | BankAccountData | PiiData | undefined
  ): Observable<TokenResult> {
    return this.stripe$.asObservable().pipe(
      filter(stripe => Boolean(stripe)),
      switchMap(s => {
        const stripe = s as StripeJS;

        if (isAccount(a) && isAccountData(b)) {
          return from(stripe.createToken(a, b));
        } else if (isBankAccount(a) && isBankAccountData(b)) {
          return from(stripe.createToken(a, b));
        } else if (isPii(a) && isPiiData(b)) {
          return from(stripe.createToken(a, b));
        } else {
          return from(
            stripe.createToken(a as Element, b as CardDataOptions | undefined)
          );
        }
      }),
      first()
    );
  }

  public createSource(
    a: Element | SourceData,
    b?: SourceData | undefined
  ): Observable<SourceResult> {
    return this.stripe$.asObservable().pipe(
      filter(stripe => Boolean(stripe)),
      switchMap(s => {
        const stripe = s as StripeJS;

        if (isSourceData(a)) {
          return from(stripe.createSource(a as SourceData));
        }
        return from(stripe.createSource(a as Element, b));
      }),
      first()
    );
  }

  public retrieveSource(source: SourceParams): Observable<SourceResult> {
    return this.stripe$.asObservable().pipe(
      filter(stripe => Boolean(stripe)),
      switchMap(s => {
        const stripe = s as StripeJS;

        return from(stripe.retrieveSource(source));
      }),
      first()
    );
  }

  public paymentRequest(options: PaymentRequestOptions) {
    const stripe = this.getInstance();
    if (stripe) {
      return stripe.paymentRequest(options);
    }
    return undefined;
  }

  public handleCardPayment(clientSecret: string, el: Element, data?: any) {
    const stripe = this.getInstance();
    if (stripe) {
      return stripe.handleCardPayment(clientSecret, el, data);
    }
    return undefined;
  }

  public confirmPaymentIntent(clientSecret: string, el: Element, data?: any) {
    const stripe = this.getInstance();
    if (stripe) {
      return stripe.confirmPaymentIntent(clientSecret, el, data);
    }
    return undefined;
  }

  public retrievePaymentIntent(clientSecret: string) {
    const stripe = this.getInstance();
    if (stripe) {
      return stripe.retrievePaymentIntent(clientSecret);
    }
    return undefined;
  }
}
