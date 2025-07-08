import { useState } from "react";
import SendIcon from "../../assets/icons/send.svg?react";
import { cn } from "../../lib/tailwind";

interface IProps {
  handleInputValue: (val: string) => void;
  input_placeholder?: string;
  initial_value: string;
}

const MetaDataInputBox = ({ handleInputValue, input_placeholder, initial_value }: IProps) => {
  //state
  const [inputValue, setInputValue] = useState(initial_value ?? "");

  //methods
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
  }

  function handleBlur() {
    handleInputValue(inputValue.trim());
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInputValue(inputValue.trim());
      setInputValue("");
    }
  }

  function handleSendClick() {
    handleInputValue(inputValue.trim());
  }



  return (
    <div className="flex gap-2 items-center w-full z-10">
      <div className="flex gap-2 items-center bg-gray-100 rounded-xl py-1 px-2 w-full">
        <textarea
          autoFocus
          className="rounded-xl p-1 resize-none outline-none w-full"
          rows={inputValue.trim() === "" ? 1 : 3}
          cols={40}
          placeholder={input_placeholder ?? "Add a comment"}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          value={inputValue}
        ></textarea>

        <button
          className={cn(
            "border border-transparent cursor-pointer hover:border-gray-400  p-[0.1rem] rounded-full h-fit",
            inputValue.trim() === "" ? "bg-gray-300" : "bg-blue-400"
          )}
          onClick={handleSendClick}
        >
          <SendIcon fill="white" className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default MetaDataInputBox;
