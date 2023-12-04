import { types } from "replugged";
export default [
  {
    find: "openAvatarDecorationModal:",
    replacements: [
      {
        match:
          /(\.DECORATION_TO_AVATAR_RATIO})(.{100,150})(\w+\.\w+\("\d+"\)\.then\(\w+\.bind\(\w+,"\d+"\)\);)/,
        replace: (_, prefix, suffix, loader) =>
          `${prefix} let decorLoaded=${loader}${suffix}decorLoaded;`,
      },
    ],
  },
] as types.PlaintextPatch[];
