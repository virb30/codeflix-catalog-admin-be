export type FieldsError = {
    [field: string]: string[];
}

export interface IValidatorFields<PropsValidated> {
    errors: FieldsError | null;
    validatedData: PropsValidated | null;
    validate(data: any): boolean;
}