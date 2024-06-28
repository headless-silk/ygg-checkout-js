import { CheckoutSelectors, CustomerRequestOptions, CustomError } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { noop } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';
import { isErrorWithType } from '../common/error';
import canSignOut, { isSupportedSignoutMethod } from '../customer/canSignOut';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';
import { IconCheck } from '../ui/icon';

import CheckoutStepType from './CheckoutStepType';


export interface CustomerInfoProps {
    onSignOut?(event: CustomerSignOutEvent): void;
    onSignOutError?(error: CustomError): void;
}

interface WithCheckoutCustomerInfoProps {
    email: string;
    methodId: string;
    isSignedIn: boolean;
    isSigningOut: boolean;
    signOut(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
}

export interface CheckoutStepHeaderProps {
    heading: ReactNode;
    isActive?: boolean;
    isComplete?: boolean;
    isEditable?: boolean;
    summary?: ReactNode;
    type: CheckoutStepType;
    onEdit?(type: CheckoutStepType): void;
}

export interface CustomerSignOutEvent {
    isCartEmpty: boolean;
}


const CheckoutStepHeader: FunctionComponent<CheckoutStepHeaderProps & WithCheckoutCustomerInfoProps & CustomerInfoProps> = ({
    heading,
    isActive,
    isComplete,
    isEditable,
    onEdit,
    summary,
    type,
    isSignedIn,
    methodId,
    signOut,
    onSignOut = noop,
    onSignOutError = noop
}) => {

    const handleSignOut: () => Promise<void> = async () => {
        try {
            if (isSupportedSignoutMethod(methodId)) {
                await signOut({ methodId });
                onSignOut({ isCartEmpty: false });
                // window.location.reload();
            } else {
                await signOut();
                onSignOut({ isCartEmpty: false });
            }
        } catch (error) {
            if (isErrorWithType(error) && error.type === 'checkout_not_available') {
                onSignOut({ isCartEmpty: true });
            } else {
                onSignOutError(error);
            }
        }
    };

    return (
        <div
            className={classNames('stepHeader', {
                'is-readonly': !isEditable,
                'is-clickable': isEditable && !isActive,
            })}
            onClick={preventDefault(isEditable && onEdit ? () => onEdit(type) : noop)}
        >
            <div className='stepHeader-header'>
                <div className="stepHeader-figure stepHeader-column">
                    <IconCheck
                        additionalClassName={classNames(
                            'stepHeader-counter',
                            'optimizedCheckout-step',
                            { 'stepHeader-counter--complete': isComplete },
                        )}
                    />

                    <h2 className="stepHeader-title optimizedCheckout-headingPrimary">{heading}</h2>
                </div>



                {isEditable && !isActive && (
                    <div className="stepHeader-actions stepHeader-column">
                        <Button
                            aria-expanded={isActive}
                            size={ButtonSize.Tiny}
                            testId="step-edit-button"
                            variant={ButtonVariant.Secondary}
                        >
                            <TranslatedString id="common.edit_action" />
                        </Button>
                    </div>
                )}

                {isSignedIn && <div className="stepHeader-actions stepHeader-column">
                    <Button
                        aria-expanded={isActive}
                        onClick={handleSignOut}
                        size={ButtonSize.Tiny}
                        testId="step-edit-button"
                        variant={ButtonVariant.Secondary}
                    >
                        Sign Out
                    </Button>
                </div>}


            </div>
            <div
                className="stepHeader-body stepHeader-column optimizedCheckout-contentPrimary"
                data-test="step-info"
            >
                {!isActive && isComplete && summary}
            </div>
        </div>
    );
};

function mapToWithCheckoutCustomerInfoProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutCustomerInfoProps | null {
    const {
        data: { getBillingAddress, getCheckout, getCustomer },
        statuses: { isSigningOut },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();

    if (!billingAddress || !checkout || !customer) {
        return null;
    }

    const methodId =
        checkout.payments && checkout.payments.length === 1 ? checkout.payments[0].providerId : '';

    return {
        email: billingAddress.email || customer.email,
        methodId,
        isSignedIn: canSignOut(customer, checkout, methodId),
        isSigningOut: isSigningOut(),
        signOut: checkoutService.signOutCustomer,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CheckoutStepHeader);
