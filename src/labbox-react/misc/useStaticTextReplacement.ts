// The purpose of this hook is to interpolate runtime values into static Markdown.
// It isn't terribly robust and care should be taken not to execute anything this has been
// run on, but it will allow e.g. replacement of %%USERNAME key with the actual logged-in
// user's name.
//
// Alternatively, we could use something like remark, but that seems very heavy-weight.
//
// The scheme is that the source markdown file will contain a set of interpolation points,
// of the form <|KEY|>. (Namespace is limited, but this combination has a clear start and
// end, without overlapping with any existing Markdown synatx.) When the hook is called,
// it takes a Markdown file (processed into a single string) along with an object
// of key-value pairs. The input file is scanned for each key, iteratively, and if
// the key is found, it will be replaced with the corresponding value.
// So for instance, a document which in raw form contains:
// > Try typing `$ ps aux | grep 'sorting' > <|OUTPUT_FILE|>`
// would be passed with an object including {'OUTPUT_FILE', 'my_processes.csv'}
// and would finally be displayed as:
// > Try typing `$ ps aux | grep 'sorting' > my_processes.csv
//
// Valid keys must contain only letters, dashes, and underscores. Lowercase letters
// are allowed, but uppercase is preferred. Keys must be only a single token (no
// internal spaces.)
//
// Valid replacement values must not include the < > or | characters, which prevents
// adding HTML elements into the resulting Markdown, and also doing any weird
// recursion tricks (since one key's replacement value can't be re-replaced by another).
//
// In the event an invalid key or value are detected, the original string will be
// returned, and a warning message will be printed to console.

// Validate individual keys.
const validateKey = (key: string): boolean => {
    if (!/^[-\w]+$/m.test(key)) return false
    return true
}

// Validate replacement values.
const validateReplacement = (val: string): boolean => {
    if (/[<>|]/m.test(val)) return false
    return true
}

const useStaticTextReplacement = (raw: string, replacements: {[key: string]: string}) => {
    let processed = raw
    Object.keys(replacements).forEach((key) => {
        if (!validateKey(key)) {
            console.log(`Warning: interpolation key ${key} is not valid.`)
            return raw
        }
        if (!validateReplacement(replacements[key])) {
            console.log(`Warning: replacement value ${replacements[key]} is not valid for interpolation.`)
            return raw
        }
        const expr = new RegExp(`<\\|${key}\\|>`, 'mg')
        processed = processed.replaceAll(expr, replacements[key])
    })
    return processed
}

export default useStaticTextReplacement