import { builder, Builder } from "@builder.io/react";
import dynamic from "next/dynamic";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(
  dynamic(() => import("./components/ClaimTreasure/ClaimTreasure")),
  {
    name: "ClaimTreasure",
    inputs: [
      {
        name: "title",
        type: "string",
      },
      {
        name: "poster",
        type: "string",
      },
      {
        name: "mediaSrc",
        type: "string",
      },
      {
        name: "uniqueName",
        type: "string",
      },
      {
        name: "amount",
        type: "string",
      },
      {
        name: "chainId",
        type: "number",
      }
    ],
  },
);

Builder.registerComponent(
  dynamic(() => import("./components/Treasure/Treasure")),
  {
    name: "Treasure",
    inputs: [
      {
        name: "title",
        type: "string",
      },
      {
        name: "poster",
        type: "string",
      },
      {
        name: "mediaSrc",
        type: "string",
      },
      {
        name: "uniqueName",
        type: "string",
      },
      {
        name: "amount",
        type: "string",
      },
      {
        name: "chainId",
        type: "number",
      }
    ],
  },
);