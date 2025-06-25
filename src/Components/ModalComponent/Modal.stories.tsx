import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Modal, ModalType } from "./Modal";

export default {
  title: "Components/Modal",
  component: Modal,
  decorators: [(Story) => <Story />],
} as Meta;

const ModalTemplate: StoryFn<ModalType> = (args) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-sm border rounded-full border-strokeGreyThree"
      >
        Open Modal
      </button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {args.layout === "default" ? (
          <div className="absolute top-0 left-0 p-2 bg-white rounded-md w-[300px]">
            <h2 className="font-bold text-md">Modal Content</h2>
            <p>Render your component here.</p>
          </div>
        ) : (
          <div className="p-4 bg-white">
            <h2 className="text-lg font-bold">Modal Content</h2>
            <p>Render your component here.</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export const DefaultModal = ModalTemplate.bind({});
DefaultModal.args = {
  size: "medium",
  layout: "default",
};

export const RightModal = ModalTemplate.bind({});
RightModal.args = {
  size: "medium",
  layout: "right",
};
