import { sampleReports, sampleStudent } from "./report/content";

export const DEMO_PARENT_BIRTH = "160101";
export const DEMO_PARENT_PHONE_LAST4 = "1234";
export const DEMO_PARENT_PIN = "1234";
export const DEMO_PORTAL_TOKEN = "demo-portal";

export function isDemoPortalAccess(input: {
  token: string;
  birthYYMMDD: string;
  phoneLast4: string;
  pin: string;
}) {
  return (
    input.token === DEMO_PORTAL_TOKEN &&
    input.birthYYMMDD === DEMO_PARENT_BIRTH &&
    input.phoneLast4 === DEMO_PARENT_PHONE_LAST4 &&
    input.pin === DEMO_PARENT_PIN
  );
}

export function getDemoPortalData() {
  return {
    student: sampleStudent,
    reports: sampleReports,
  };
}
