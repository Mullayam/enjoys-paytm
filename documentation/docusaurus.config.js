const repoUrl = "https://github.com/Mullayam/enjoys-paytm";

module.exports = {
  title: "PayTM PG KIT",
  tagline: "PayTM PG KIT Documentation",
  url: "https://paytm-pg-kit-docs.enjoys.in",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Enjoys",
  projectName: "@enjoys/paytm",
  themeConfig: {
    navbar: {
      logo: {
        alt: "PayTM PG KIT Logo",
        src: "img/paytm.png",
      },
      items: [
        {
          href: "https://paytm-pg-kit-docs.enjoys.in",
          label: "Home",
          position: "right",
        },
        {
          href: repoUrl,
          label: "GitHub",
          position: "right",

          className: "github",
        },
        // {
        //   href: "https://paytm-pg-kit-docs.enjoys.in/playground",
        //   label: "Playground",
        //   position: "right",
        // },
      ],
    },
    footer: {
      style: "light",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Paytm PG KIT By ENJOYS`,
    },
    colorMode: {
      respectPrefersColorScheme: false,
      defaultMode: "light",
      disableSwitch: true,
    },
    prism: {
      theme: require("./themes/livekit"),
      additionalLanguages: [
        "swift",
        "kotlin",
        "go",
        "groovy",
        "ini",
        "dart",
        "ruby",
      ],
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/deploy",
            from: ["/guides/deploy/prepare", "/guides/deploy"],
          },
          {
            to: "/deploy/vm",
            from: ["/guides/deploy/instance"],
          },
          {
            to: "/deploy/kubernetes",
            from: ["/guides/deploy/kubernetes"],
          },
          {
            to: "/deploy/test-monitor",
            from: ["/guides/deploy/tuning"],
          },
          {
            to: "/deploy/benchmark",
            from: ["/guides/deploy/benchmark"],
          },
          // {
          //   to: '/deploy/recorder',
          //   from: ['/guides/deploy/recorder'],
          // },
        ],
      },
    ],
  ],
};
