import { TalkingBot } from "./talkingbot";

export type KofiEventType =
  | "Donation"
  | "Subscription"
  | "Commission"
  | "Shop Order";
interface KofiAlertData {
  is_subscription: boolean;
  message: string | null;
  sender: string;
  tier_name: string | null;
  amount: string;
  currency: string;
}
export interface ShopItem {
  direct_link_code: string;
  variation_name: string;
  quantity: number;
}
export interface ShippingInfo {
  full_name: string;
  street_address: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country: string;
  country_code: string;
  telephone: string;
}
export interface KofiEvent {
  verification_token: string;
  message_id: string;
  timestamp: string; // in json format
  type: KofiEventType;
  is_public: boolean;
  from_name: string;
  message: string | null; // Should not be shown if not is_public
  amount: string;
  url: string;
  currency: string;
  is_subscription_payment: boolean;
  is_first_subscription_payment: boolean;
  kofi_transaction_id: string;
  tier_name: string | null; // null if type is Donation
  shop_items: ShopItem[] | null;
  shipping: ShippingInfo | null;
}
export function isKofiEvent(obj: any): obj is KofiEvent {
  if (typeof obj !== "object" || obj === null) return false;

  const isString = (val: any) => typeof val === "string";
  const isBoolean = (val: any) => typeof val === "boolean";
  const isNullableString = (val: any) =>
    val === null || typeof val === "string";

  const isShopItem = (item: any) =>
    item &&
    isString(item.direct_link_code) &&
    isString(item.variation_name) &&
    typeof item.quantity === "number";

  const isShippingInfo = (info: any) =>
    info &&
    isString(info.full_name) &&
    isString(info.street_address) &&
    isString(info.city) &&
    isString(info.state_or_province) &&
    isString(info.postal_code) &&
    isString(info.country) &&
    isString(info.country_code) &&
    isString(info.telephone);

  const validTypes = ["Donation", "Subscription", "Commission", "Shop Order"];
  if (!validTypes.includes(obj.type)) return false;

  return (
    isString(obj.verification_token) &&
    isString(obj.message_id) &&
    isString(obj.timestamp) &&
    isBoolean(obj.is_public) &&
    isString(obj.from_name) &&
    isNullableString(obj.message) &&
    isString(obj.amount) &&
    isString(obj.url) &&
    isString(obj.currency) &&
    isBoolean(obj.is_subscription_payment) &&
    isBoolean(obj.is_first_subscription_payment) &&
    isString(obj.kofi_transaction_id) &&
    isNullableString(obj.tier_name) &&
    (obj.shop_items === null ||
      (Array.isArray(obj.shop_items) && obj.shop_items.every(isShopItem))) &&
    (obj.shipping === null || isShippingInfo(obj.shipping))
  );
}
export function handleKofiEvent(bot: TalkingBot, event: KofiEvent) {
  switch (event.type) {
    case "Donation":
    case "Subscription":
      const alert: KofiAlertData = {
        tier_name: event.tier_name,
        is_subscription: event.is_subscription_payment,
        message: event.is_public ? event.message : null,
        sender: event.from_name,
        amount: event.amount,
        currency: event.currency,
      };
      bot.ioalert.emit("alert", alert);
      break;
    case "Commission":
    case "Shop Order":
    default:
      break;
  }
}
