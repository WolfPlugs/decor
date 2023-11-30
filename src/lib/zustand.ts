import { webpack } from "replugged"


export const create: typeof import("zustand").default = webpack.getBySource("will be removed in v4") 
