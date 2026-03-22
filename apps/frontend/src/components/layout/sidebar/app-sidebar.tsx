import * as React from "react";
import { NavMain, NavSubItem } from "@/components/layout/sidebar/nav-main";
import { NavProjects } from "@/components/layout/sidebar/nav-projects";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiGalleryLine,
  RiPulseLine,
  RiCommandLine,
  RiCropLine,
  RiPieChartLine,
  RiMapLine,
  RiRobot2Line,
  RiTerminalBoxLine,
} from "@remixicon/react";
import type { AgentMetadata, TerminalMetadata } from "@pixxl/shared";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  agents: AgentMetadata[];
  terminals: TerminalMetadata[];
  isLoading: boolean;
  onEditAgent?: (agent: AgentMetadata) => void;
  onEditTerminal?: (terminal: TerminalMetadata) => void;
  onDeleteAgent?: (id: string) => void;
  onDeleteTerminal?: (id: string) => void;
  onDeleteCommand?: (id: string) => void;
  onAddCommand?: () => void;
  onNavigateTerminal?: (terminal: TerminalMetadata) => void;
  onCreateAgent?: (name: string) => void;
  onCreateTerminal?: (name: string) => void;
}

const EmptyItem: NavSubItem = { title: "", url: "#", disabled: true };

function createMenuItems<T extends { id: string; name: string }>(options: {
  items: T[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
  addLabel: string;
}): NavSubItem[] {
  const { items, onAdd, onEdit, onDelete, isLoading, addLabel } = options;
  const addItem: NavSubItem = onAdd
    ? { title: `+ Add ${addLabel}`, url: "#", onClick: onAdd }
    : EmptyItem;

  if (isLoading || items.length === 0) {
    return [EmptyItem, addItem];
  }

  return [
    ...items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        title: item.name,
        url: "#",
        id: item.id,
        onEdit: onEdit ? () => onEdit(item) : undefined,
        onDelete: onDelete ? () => onDelete(item.id) : undefined,
      })),
    addItem,
  ];
}

export function AppSidebar({
  agents,
  terminals,
  isLoading,
  onEditAgent,
  onEditTerminal,
  onDeleteAgent,
  onDeleteTerminal,
  onDeleteCommand,
  onAddCommand,
  onNavigateTerminal,
  onCreateAgent,
  onCreateTerminal,
  ...props
}: AppSidebarProps) {
  const navMain = React.useMemo(
    () => [
      {
        title: "Agents",
        url: "#",
        icon: <RiRobot2Line />,
        items: createMenuItems({
          items: agents,
          onAdd: onCreateAgent ? () => onCreateAgent(`Agent ${agents.length + 1}`) : undefined,
          onEdit: onEditAgent,
          onDelete: onDeleteAgent,
          isLoading,
          addLabel: "Agent",
        }),
      },
      {
        title: "Terminals",
        url: "#",
        icon: <RiTerminalBoxLine />,
        items: (() => {
          if (isLoading || terminals.length === 0) {
            return [
              EmptyItem,
              onCreateTerminal
                ? {
                  title: "+ Add Terminal",
                  url: "#",
                  onClick: () => onCreateTerminal(`Terminal ${terminals.length + 1}`),
                }
                : EmptyItem,
            ];
          }
          return [
            ...terminals.map((terminal) => ({
              title: terminal.name,
              url: "#",
              id: terminal.id,
              onClick: onNavigateTerminal ? () => onNavigateTerminal(terminal) : undefined,
              onEdit: onEditTerminal ? () => onEditTerminal(terminal) : undefined,
              onDelete: onDeleteTerminal ? () => onDeleteTerminal(terminal.id) : undefined,
            })),
            onCreateTerminal
              ? {
                title: "+ Add Terminal",
                url: "#",
                onClick: () => onCreateTerminal(`Terminal ${terminals.length + 1}`),
              }
              : EmptyItem,
          ];
        })(),
      },
      {
        title: "Commands",
        url: "#",
        icon: <RiCommandLine />,
        items: createMenuItems({
          items: [],
          onAdd: onAddCommand,
          onDelete: onDeleteCommand,
          isLoading: false,
          addLabel: "Command",
        }),
      },
    ],
    [
      agents,
      terminals,
      isLoading,
      onCreateAgent,
      onCreateTerminal,
      onEditAgent,
      onEditTerminal,
      onDeleteAgent,
      onDeleteTerminal,
      onDeleteCommand,
      onAddCommand,
      onNavigateTerminal,
    ],
  );

  const data = {
    user: { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" },
    teams: [
      { name: "Acme Inc", logo: <RiGalleryLine />, plan: "Enterprise" },
      { name: "Acme Corp.", logo: <RiPulseLine />, plan: "Startup" },
      { name: "Evil Corp.", logo: <RiCommandLine />, plan: "Free" },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: <RiCropLine /> },
      { name: "Sales & Marketing", url: "#", icon: <RiPieChartLine /> },
      { name: "Travel", url: "#", icon: <RiMapLine /> },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
