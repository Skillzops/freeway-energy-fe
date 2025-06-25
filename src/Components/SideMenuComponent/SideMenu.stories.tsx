import { Meta, StoryFn } from "@storybook/react";
import { SideMenu, SideMenuType } from "./SideMenu";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "Components/SideMenu",
  component: SideMenu,
} as Meta;

const SideMenuTemplate: StoryFn<SideMenuType> = (args) => (
  <MemoryRouter>
    <SideMenu {...args} />
  </MemoryRouter>
);

export const sideMenu = SideMenuTemplate.bind({});
sideMenu.args = {
  navigationList: [
    {
      title: "All Customer",
      link: "/all-customers",
      count: 50,
    },
    {
      title: "New Customers",
      link: "/new-customers",
      count: 102,
    },
    {
      title: "Defaulting Customers",
      link: "/defaulting-customers",
      count: 120000,
    },
    {
      title: "Barred Customers",
      link: "/barred-customers",
      count: 50,
    },
  ],
};
