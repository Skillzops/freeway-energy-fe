import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react";
import { MenuButton, MenuButtonType } from "./MenuButton";
import { navData } from "./navInfo";

export default {
  title: "Components/MenuButton",
  component: MenuButton,
} as Meta;

const MenuTemplate: StoryFn<MenuButtonType> = (args) => (
  <MemoryRouter>
    <MenuButton {...args} />
  </MemoryRouter>
);

export const menuButton = MenuTemplate.bind({});
menuButton.args = {
  buttonStyle: "",
  sections: navData,
};
