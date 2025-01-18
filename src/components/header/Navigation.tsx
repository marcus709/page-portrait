import { useState } from "react";
import { Menu, MenuItem, HoveredLink } from "@/components/ui/navbar-menu";

interface NavigationProps {
  onScrollToSection: (sectionId: string) => void;
  onCommunityClick: () => void;
}

export const Navigation = ({ onScrollToSection, onCommunityClick }: NavigationProps) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Menu setActive={setActive}>
      <MenuItem setActive={setActive} active={active} item="Features">
        <div className="flex flex-col space-y-4 text-sm bg-white text-black rounded-lg shadow-lg p-4">
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Story Development
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Character Creation
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            AI Assistance
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Character-Aware AI
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Dynamic Characters
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Writing Community
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('features')}>
            Story Logic Analysis
          </HoveredLink>
        </div>
      </MenuItem>
      <MenuItem setActive={setActive} active={active} item="Pricing">
        <div className="flex flex-col space-y-4 text-sm bg-white text-black rounded-lg shadow-lg p-4">
          <HoveredLink onClick={() => onScrollToSection('pricing')}>
            Free Trial
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('pricing')}>
            Creator Plan
          </HoveredLink>
          <HoveredLink onClick={() => onScrollToSection('pricing')}>
            Professional Plan
          </HoveredLink>
        </div>
      </MenuItem>
      <MenuItem setActive={setActive} active={active} item="Dashboard">
        <div className="flex flex-col space-y-4 text-sm bg-white text-black rounded-lg shadow-lg p-4">
          <HoveredLink to="/dashboard">Overview</HoveredLink>
          <HoveredLink to="/dashboard/stories">My Stories</HoveredLink>
          <HoveredLink to="/dashboard/characters">Characters</HoveredLink>
        </div>
      </MenuItem>
      <MenuItem setActive={setActive} active={active} item="Community">
        <div className="flex flex-col space-y-4 text-sm bg-white text-black rounded-lg shadow-lg p-4">
          <HoveredLink onClick={onCommunityClick}>Writers Hub</HoveredLink>
          <HoveredLink onClick={onCommunityClick}>Story Sharing</HoveredLink>
          <HoveredLink onClick={onCommunityClick}>Collaborations</HoveredLink>
        </div>
      </MenuItem>
    </Menu>
  );
};