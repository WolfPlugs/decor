import { settings } from "replugged";

export const defaultSettings = {};
export const authorizationToken = await settings.init("decor.auth", defaultSettings);
