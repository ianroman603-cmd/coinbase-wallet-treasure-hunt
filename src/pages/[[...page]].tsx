import React from "react";
import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import { type BuilderContent } from "@builder.io/sdk";
import { type GetStaticProps } from "next";
import "../builder-registry";
import { ConnectButton } from "thirdweb/react";
import { client } from "~/providers/Thirdweb";
import { createWallet } from "thirdweb/wallets";
import { base } from "thirdweb/chains";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

// Define a function that fetches the Builder
// content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userAttributes: { urlPath: string } = {
    urlPath: "/" + ((params?.page as string[])?.join("/") || ""),
  };
  // Fetch the builder content for the given page
  const page = await builder
    .get("page", {
      userAttributes,
    })
    .toPromise() as BuilderContent | null;

  // Return the page content as props
  return {
    props: {
      page: page ?? null,
    },
    // Revalidate the content every 5 seconds
    revalidate: 5,
  };
};

// Define a function that generates the
// static paths for all pages in Builder
export async function getStaticPaths() {
  // Get a list of all pages in Builder
  const pages = await builder.getAll("page", {
    // We only need the URL field
    fields: "data.url",
    options: { noTargeting: true },
  });

  // Generate the static paths for all pages in Builder
  return {
    paths: pages
      .map((page) => String(page.data?.url))
      .filter((url) => url !== "/"),
    fallback: "blocking",
  };
}

// Define the Page component
export default function Page({ page }: { page: BuilderContent | null }) {
  const isPreviewing = useIsPreviewing();

  // If the page content is not available
  // and not in preview mode, show a 404 error page
  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  // If the page content is available, render
  // the BuilderComponent with the page content
  return (
    <>
      <Head>
        <title>{page?.data?.title}</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between my-4">
          <div />
          <ConnectButton 
            client={client}
            chain={base}
            wallets={[createWallet("com.coinbase.wallet")]}
            recommendedWallets={[createWallet("com.coinbase.wallet")]}
            theme="light"
          />
        </div>
      </div>
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={page ?? undefined} />
    </>
  );
}
