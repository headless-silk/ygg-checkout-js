import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { FieldProps, FormikProps, withFormik } from 'formik';
import React, { FunctionComponent , memo, ChangeEventHandler as ReactChangeEventHandler, ReactNode, useCallback, useState } from 'react';
import { object, string } from 'yup';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { getPrivacyPolicyValidationSchema, PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, DynamicFormField, Fieldset, Form, Input, Label, Legend } from '../ui/form';

import EmailField from './EmailField';
import SubscribeField from './SubscribeField';
import { SubscribeSessionStorage } from './SubscribeSessionStorage';


function getShouldSubscribeValue(requiresMarketingConsent: boolean, defaultShouldSubscribe: boolean) {
    if (SubscribeSessionStorage.getSubscribeStatus()) {
        return true;
    }

    return requiresMarketingConsent ? false : defaultShouldSubscribe
}

const handleTextarea: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        return event.target.value
    };

export interface GuestFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    continueAsGuestButtonLabelId: string;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?:string;
    lastName?:string;
    eventName?:string;
    anonymously?:boolean;
    dedicationInfo?:string;
    dedication?:boolean;
    isLoading: boolean;
    privacyPolicyUrl?: string;
    isExpressPrivacyPolicy: boolean;
    isFloatingLabelEnabled?: boolean;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    onShowLogin(): void;
}

export interface GuestFormValues {
    email: string; 
    firstName?:string;
    lastName?:string;
    eventName?:string;
    shouldSubscribe: boolean;
    isDedication?:boolean;
    isAnonymously?:boolean
}

// TODO: 解决点击编辑信息消失的问题
const GuestForm: FunctionComponent<
    GuestFormProps & WithLanguageProps & FormikProps<GuestFormValues>
> = ({
    canSubscribe,
    checkoutButtons,
    // continueAsGuestButtonLabelId,
    isLoading,
    onChangeEmail,
    onShowLogin,
    privacyPolicyUrl,
    requiresMarketingConsent,
    isExpressPrivacyPolicy,
    isFloatingLabelEnabled,
}) => {
        const Console = console
        const [isDedication, setIsDedication] = useState(false)
        const [isAnonymously, setIsAnonymously] = useState(false)
        const firstNameField: FormFieldType = { id: "field_1", name: "firstName", custom: false, label: "First Name", required: true, default: "", type: "string", fieldType: 'text' }
        const lastNameField: FormFieldType = { id: "field_2", name: "lastName", custom: false, label: "Last Name", required: true, default: "", type: "string", fieldType: 'text' }
        const eventNameField: FormFieldType = { id: "field_3", name: "eventName", custom: false, label: "Your name as it will appear on the event page", required: false, default: "", type: "string", fieldType: 'text' }

        const renderField = useCallback(
            (fieldProps: FieldProps<boolean>) => (
                <SubscribeField {...fieldProps} requiresMarketingConsent={requiresMarketingConsent} />
            ),
            [requiresMarketingConsent],
        );

        const handleClickAnonymously = useCallback((e) => {
            setIsAnonymously(e.target.checked)
        }, [])

        const handleClickDedication = useCallback((e) => {
            setIsDedication(e.target.checked)
        }, [])

        Console.log(isDedication, isAnonymously)

        return (
            <Form
                className="checkout-form"
                id="checkout-customer-guest"
                testId="checkout-customer-guest"
            >
                <Fieldset
                    legend={
                        <Legend hidden>
                            <TranslatedString id="customer.guest_customer_text" />
                        </Legend>
                    }
                >
                    <div className="customerEmail-container">
                        <DynamicFormField autocomplete="First Name" extraClass='dynamic-form-field--firstName' field={firstNameField} isFloatingLabelEnabled={true} placeholder='First Name' />
                        <DynamicFormField extraClass='dynamic-form-field--lastName' field={lastNameField} isFloatingLabelEnabled={true} placeholder='Last Name' />
                        <EmailField isFloatingLabelEnabled={isFloatingLabelEnabled} onChange={onChangeEmail} />
                        <DynamicFormField field={eventNameField} isFloatingLabelEnabled={true} placeholder='Your name as it will appear on the event page (Optional)' />
                        
                        <div className='customer-checkbox'>
                            <div className='form-field'><Input checked={isAnonymously} className='form-checkbox' id="anonymously" name='anonymously' onChange={handleClickAnonymously} type='checkbox'  /><Label htmlFor='anonymously'>I would like to donate these goods anonymously</Label></div>
                            <div className='form-field'><Input checked={isDedication} className='form-checkbox' id="dedication" name='dedication' onChange={handleClickDedication}  type='checkbox'  /><Label htmlFor='dedication'>I would like to leave a dedication</Label></div>

                            {isDedication &&<textarea className='customer-checkbox_leaveTextarea form-input' id="dedicationInfo" name="dedicationInfo" onChange={handleTextarea} placeholder='Leave a dedication' />}
                            
                            {(canSubscribe || requiresMarketingConsent) && (
                                <BasicFormField name="shouldSubscribe" render={renderField} />
                            )}
                        </div>

                        <div
                            className={classNames('form-actions customerEmail-action', {
                                'customerEmail-floating--enabled': isFloatingLabelEnabled,
                            })}
                        >
                            <Button
                                className="customerEmail-button"
                                id="checkout-customer-continue"
                                isLoading={isLoading}
                                testId="customer-continue-as-guest-button"
                                type="submit"
                                variant={ButtonVariant.Primary}
                            >
                                {/* <TranslatedString id={continueAsGuestButtonLabelId} /> */}
                                Continue with Card Payment <img src='https://store-z71kel45y3.mybigcommerce.com/content/continue.svg' />
                            </Button>
                        </div>
                    </div>

                    {privacyPolicyUrl && (
                        <PrivacyPolicyField isExpressPrivacyPolicy={isExpressPrivacyPolicy} url={privacyPolicyUrl} />
                    )}

                    {!isLoading && (
                        <p>
                            <TranslatedString id="customer.login_text" />{' '}
                            <a
                                data-test="customer-continue-button"
                                id="checkout-customer-login"
                                onClick={onShowLogin}
                                role="button"
                                tabIndex={0}
                            >
                                <TranslatedString id="customer.login_action" />
                            </a>
                        </p>
                    )}

                    {checkoutButtons}
                </Fieldset>
            </Form >
        );
    };

export default withLanguage(
    withFormik<GuestFormProps & WithLanguageProps, GuestFormValues>({
        mapPropsToValues: ({
            email = '',
            firstName='',
            lastName='',
            eventName='',
            dedicationInfo='',
            anonymously=false,
            dedication=false,
            defaultShouldSubscribe = false,
            requiresMarketingConsent,
        }) => ({
            email,
            firstName,
            lastName,
            eventName,
            anonymously,
            dedicationInfo,
            dedication,
            shouldSubscribe: getShouldSubscribeValue(requiresMarketingConsent, defaultShouldSubscribe),
            privacyPolicy: false,
        }),
        handleTextarea:  (event) => {
            // 使用断言来确保target是HTMLTextAreaElement类型
            // const value = (event.target as HTMLTextAreaElement).value;

            // 现在你可以安全地使用value
            // return value;
            }
            ,
        handleSubmit: (values, { props: { onContinueAsGuest } }) => {
            onContinueAsGuest(values);
        },
        validationSchema: ({ language, privacyPolicyUrl, isExpressPrivacyPolicy }: GuestFormProps & WithLanguageProps) => {
            const email = string()
                .email(language.translate('customer.email_invalid_error'))
                .max(256)
                .required(language.translate('customer.email_required_error'));
            const firstName=string().required('First name is required');
            const lastName=string().required('Last name is required');
            const baseSchema = object({ email,firstName,lastName});

            if (privacyPolicyUrl && !isExpressPrivacyPolicy) {
                return baseSchema.concat(
                    getPrivacyPolicyValidationSchema({
                        isRequired: !!privacyPolicyUrl,
                        language,
                    }),
                );
            }

            return baseSchema;
        },
    })(memo(GuestForm)),
);
