import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: {
      en: "MAIN MENU",
      ur: "مین مینو",
    },
    items: [
      {
        title: {
          en: "Dashboard",
          ur: "ڈیش بورڈ",
        },
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: {
          en: "File Upload",
          ur: "فائل اپلوڈ",
        },
        url: "/file-upload",
        icon: Icons.Upload,
        items: [],
      },
      {
        title: {
          en: "Reports",
          ur: "رپورٹس",
        },
        icon: Icons.Alphabet,
        items: [
          {
            title: {
              en: "Map",
              ur: "نقشہ",
            },
            url: "/reports/map",
          },
          {
            title: {
              en: "Chart",
              ur: "چارٹ",
            },
            url: "/reports/charts",
          },
        ],
      },
    ],
  },
];

