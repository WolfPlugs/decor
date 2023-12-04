type ClassNameFactoryArg = string | string[] | Record<string, unknown> | false | null | undefined | 0 | "";

export const classNameFactory = (...args: ClassNameFactoryArg[]) => {
  const classNames = args
      .filter(arg => !!arg)
      .map(arg => {
          if (typeof arg === "string" || Array.isArray(arg)) {
              return arg;
          } else if (typeof arg === "object") {
              return Object.entries(arg)
                  .filter(([name, value]) => value)
                  .map(([name]) => name);
          }
          return [];
      })
      .flat();

  return "rp-decor-" + classNames.join(" ");
};
