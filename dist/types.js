/**
 * Type definitions for СДАМ ГИА MCP Server
 */
/**
 * Supported subjects on СДАМ ГИА platform
 */
export var Subject;
(function (Subject) {
    Subject["MATH"] = "math";
    Subject["MATH_BASE"] = "mathb";
    Subject["RUSSIAN"] = "rus";
    Subject["PHYSICS"] = "phys";
    Subject["CHEMISTRY"] = "chem";
    Subject["BIOLOGY"] = "bio";
    Subject["GEOGRAPHY"] = "geo";
    Subject["HISTORY"] = "hist";
    Subject["SOCIAL"] = "soc";
    Subject["INFORMATICS"] = "inf";
    Subject["ENGLISH"] = "en";
    Subject["GERMAN"] = "de";
    Subject["FRENCH"] = "fr";
    Subject["SPANISH"] = "sp";
    Subject["LITERATURE"] = "lit";
})(Subject || (Subject = {}));
/**
 * Response format options
 */
export var ResponseFormat;
(function (ResponseFormat) {
    ResponseFormat["JSON"] = "json";
    ResponseFormat["MARKDOWN"] = "markdown";
})(ResponseFormat || (ResponseFormat = {}));
//# sourceMappingURL=types.js.map