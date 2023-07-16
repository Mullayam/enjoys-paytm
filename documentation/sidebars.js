module.exports = {
  sidebar: [
    {
      type: "doc",
      id: "index",
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
         

        {
          type: "category",
          label: "Working with Rooms",
          collapsed: true,
          items: [
            "guides/room/connect",
            "guides/room/publish",
            "guides/room/receive",
            "guides/room/data",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Next Js",
      collapsed: true,
      items: [
        "nextjs/intro",
        // "guides/room/publish",
        // "guides/room/receive",
        // "guides/room/data",
      ],
    },
    {
      type: "category",
      label: "NodeJs",
      collapsed: true,
      items: [
        "nodejs/create-server",
        "nodejs/configuration",
        "nodejs/use-on-routes",
        "nodejs/response",

        // "guides/room/publish",
        // "guides/room/receive",
        // "guides/room/data",
      ],
    },
    
  ],
};
