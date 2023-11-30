import { common } from "replugged";

const { fluxDispatcher } = common;

export default function subscribeToFluxDispatcher(event: string, callback: (data: any) => void) {
  fluxDispatcher.subscribe(event, callback)
  return () => void fluxDispatcher.unsubscribe(event, callback)
}
