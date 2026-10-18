import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";

const STORAGE_KEY = "ekhhoni:delivery:v1";
const EMPTY = { name: "", phone: "", address: "", city: "", postcode: "" };

// Bangladeshi mobile number, same rule as the server: 01[3-9]XXXXXXXX with optional +880/880
const BD_PHONE = /^(?:\+?880)?01[3-9]\d{8}$/;

/** returns { field: messageKey } for every invalid field */
export function validateDelivery(d) {
  const errors = {};
  if (d.name.trim().length < 2) errors.name = "cart.errName";
  if (!BD_PHONE.test(d.phone.replace(/[\s-]/g, ""))) errors.phone = "cart.errPhone";
  if (d.address.trim().length < 5) errors.address = "cart.errAddress";
  if (d.city.trim().length < 2) errors.city = "cart.errCity";
  return errors;
}

function load() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

/** delivery details remembered on this device; the name defaults to the Clerk profile name */
export function useDeliveryDetails() {
  const { user } = useUser();
  const [details, setDetails] = useState(load);
  const name = details.name || user?.fullName || "";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {
      // not remembered this time; checkout still works
    }
  }, [details]);

  return [{ ...details, name }, setDetails];
}
