import { useTranslation } from "next-i18next";
import { LocaleObject } from "yup/lib/locale";

const useYupLocaleObject = (): LocaleObject => {
  const { t } = useTranslation("common");

  const yupLocaleObject: LocaleObject = {
    mixed: {
      default: t("Invalid value"),
      required: t("Required"),
    },
    string: {
      min: t("Must be at least ${min} characters"),
      max: t("Must be at most ${max} characters"),
      matches: t("Value does not match the pattern"),
      email: t("Must be a valid email"),
      url: t("Must be a valid URL"),
      uuid: t("Must be a valid UUID"),
    },
    number: {
      min: t("Must be greater than or equal to ${min}"),
      max: t("Must be less than or equal to ${max}"),
      positive: t("Must be a positive number"),
      negative: t("Must be a negative number"),
      integer: t("Must be an integer"),
    },
    array: {
      min: t("Must have at least ${min} items"),
    },
  };

  return yupLocaleObject;
};

export default useYupLocaleObject;
