import { CommandMenuProps } from "@/types/types";
import { useState, useEffect } from "react";
import { getCommands } from "./camelCased/getCommands";
import { motion, AnimatePresence } from "framer-motion";

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onSelect,
  filter,
  splitView,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = getCommands(splitView);
  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(filter.toLowerCase()) ||
      command.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          e.stopPropagation(); // Prevent form submission
          if (filteredCommands[selectedIndex]) {
            onSelect(`/${filteredCommands[selectedIndex].command}`);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute max-w-4xl bottom-full left-0 w-full mb-2 bg-[#1E1E1E]/80 backdrop-blur-sm border border-[#383838] rounded-lg shadow-lg overflow-hidden"
          onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
        >
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCommands.map((command, index) => (
              <button
                key={command.action}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(`/${command.command}`);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseLeave={() => setSelectedIndex(-1)}
                className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left ${
                  index === selectedIndex ? "bg-[#2f2f2f]/80" : ""
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-800/90 flex items-center justify-center text-white">
                  {command.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-200">
                    {command.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {command.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};