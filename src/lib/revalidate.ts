import { revalidatePath } from "next/cache";
import { LOCALES } from "./constants/misc";

const revalidateLocalePath = (path: string) => {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}${path}`);
  });
};

export default revalidateLocalePath;
