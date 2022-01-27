export function injectClassNames(object) {
    if (!Array.isArray(object) && typeof object === "object")
        Object.keys(object).forEach(key => document.body.innerHTML = document.body.innerHTML.replace(RegExp(key, "g"), object[key]));
}