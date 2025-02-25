import { VisibilityError } from "../types/errors";

export enum Visibility {
  ON = "on",
  OFF = "off",
}

export const parseVisibility = (visibility: string): boolean => {
  try {
    if (!Object.values(Visibility).includes(visibility as Visibility)) {
      throw new VisibilityError(
        `Invalid visibility value: '${visibility}'. Must be either '${Visibility.ON}' or '${Visibility.OFF}'`
      );
    }
    return visibility === Visibility.ON;
  } catch (e) {
    // Log the error for monitoring but default to OFF for safety - debugging statement :/
    console.warn(
      `Invalid visibility value received: ${visibility}. Defaulting to OFF`
    );
    return false;
  }
};
