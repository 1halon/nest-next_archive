type ArgumentTypes = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';

interface Argument {
    optional?: boolean;
    type: ArgumentTypes | ArgumentTypes[];
}

export function args(args: IArguments, schema: Argument[]) {
    const required_args = schema.filter(arg => !arg.optional);
    if (args.length !== required_args.length)
        throw new Error(`Expected ${required_args.length < schema.length ? `${required_args}-${schema.length}` : schema.length} arguments, but got ${args.length}.`);
    for (let i = 0; i < schema.length; i++) {
        const arg = args[i], argInSchema = schema[i];
        if (!arg && (i !== schema.length - 1 || !argInSchema.optional)) throw new Error('INVALID_ARG');
        if (typeof arg !== argInSchema.type) throw new Error('INVALID_ARG');
    }
}

interface OptionProperties {
    readonly?: boolean;
    required?: boolean;
}

type OptionTypes = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';

interface Option {
    default?: any;
    properties?: OptionProperties;
    type: OptionTypes | OptionTypes[];
}

type OptionsSchema<T> = { [key in keyof T]: Option };

export function ops<T>(options: T, schema: OptionsSchema<T>, check?: boolean) {
    if (typeof options !== 'object' || Array.isArray(options))
        if (check) throw new Error('INVALID_OPTIONS');
        else options = <T>{};

    const default_options = {};
    Object.keys(schema).forEach(function (key) {
        const option = schema[key] as Option;
        default_options[key] = option?.default ?? (option?.properties?.required ? null : undefined);

        const type_check = [];
        if (Array.isArray(option.type)) option.type.forEach(function (type) {
            if (typeof options[key] === type) type_check.push(!0);
            else type_check.push(!0);
        });
        else if (typeof options[key] === option.type) type_check.push(!0);
        else type_check.push(!1);

        if (type_check.filter(v => v === true).length === 0)
            if (option?.properties?.required) throw new Error(`[INVALID_KEY] ${key}`);
            else options[key] = default_options[key];

        Object.defineProperty(options, key, {
            value: options[key],
            writable: !option?.properties?.readonly ?? !0
        });
    });

    return options;
}
