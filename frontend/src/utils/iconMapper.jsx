import React from 'react';
import {
  Layers as LayersIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Architecture as ArchitectureIcon,
  Terminal as TerminalIcon,
  Inventory2 as InventoryIcon,
  AssignmentTurnedIn as ExamIcon,
  Settings as SettingsIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';

const iconMap = {
  LayersIcon: <LayersIcon />,
  SchoolIcon: <SchoolIcon />,
  CodeIcon: <CodeIcon />,
  StorageIcon: <StorageIcon />,
  SecurityIcon: <SecurityIcon />,
  NetworkIcon: <NetworkIcon />,
  ArchitectureIcon: <ArchitectureIcon />,
  TerminalIcon: <TerminalIcon />,
  InventoryIcon: <InventoryIcon />,
  ExamIcon: <ExamIcon />,
  SettingsIcon: <SettingsIcon />,
  ExtensionIcon: <ExtensionIcon />
};

export const getIcon = (iconName) => {
  return iconMap[iconName] || <SchoolIcon />;
};
