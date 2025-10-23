import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Thirdweb from "~/providers/Thirdweb";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={GeistSans.className}>
      <Thirdweb>
        <Component {...pageProps} />
      </Thirdweb>
    </main>
  );
};

export default api.withTRPC(MyApp);
