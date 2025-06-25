import { Meta, StoryFn } from "@storybook/react";
import { TitlePill, TitlePillType } from "./TitlePill";
import sale from "../../assets/titlepill/sale.svg";

export default {
  title: "Components/TitlePill",
  component: TitlePill,
} as Meta;

const TitlePillTemplate: StoryFn<TitlePillType> = (args) => (
  <TitlePill {...args} />
);

export const titlePill = TitlePillTemplate.bind({});
titlePill.args = {
  icon: sale,
  iconBgColor: "bg-[#FDEEC2]",
  topText: "All",
  bottomText: "SALES",
  value: "2240",
};
