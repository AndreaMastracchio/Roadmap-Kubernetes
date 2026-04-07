import React from 'react';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Architecture as ArchitectureIcon,
  Terminal as TerminalIcon,
  Layers as LayersIcon,
  Inventory2 as InventoryIcon,
  AssignmentTurnedIn as ExamIcon,
  Settings as SettingsIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';

export const minikubeModules = [
  {
    id: '01-introduzione',
    title: '1. Introduzione',
    file: '01-introduzione/README.md',
    icon: <LayersIcon />,
    level: 'Base',
    time: '15 min',
    sections: [
      { id: '01-01', title: 'Cos\'è Minikube', anchor: '1-introduzione-a-minikube' },
      { id: '01-02', title: 'Architettura', anchor: 'architettura-di-minikube' },
      { id: '01-03', title: 'Comandi Base', anchor: 'comandi-principali' },
      { id: '01-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '01-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '02-configurazione',
    title: '2. Configurazione',
    file: '02-configurazione/README.md',
    icon: <SettingsIcon />,
    level: 'Base',
    time: '20 min',
    sections: [
      { id: '02-01', title: 'Gestione Profili', anchor: 'gestione-profili' },
      { id: '02-02', title: 'Risorse e Limiti', anchor: 'risorse' },
      { id: '02-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '02-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '03-funzionalita-avanzate',
    title: '3. Funzionalità Avanzate',
    file: '03-funzionalita-avanzate/README.md',
    icon: <ExtensionIcon />,
    level: 'Intermedio',
    time: '25 min',
    sections: [
      { id: '03-01', title: 'Add-ons', anchor: 'add-ons' },
      { id: '03-02', title: 'Networking e Tunnel', anchor: 'tunneling-e-service' },
      { id: '03-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '03-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '04-ingress-dashboard',
    title: '4. Ingress e Dashboard',
    file: '04-ingress-dashboard/README.md',
    icon: <ArchitectureIcon />,
    level: 'Intermedio',
    time: '20 min',
    sections: [
      { id: '04-01', title: 'Ingress Controller', anchor: 'ingress-controller' },
      { id: '04-02', title: 'Kubernetes Dashboard', anchor: 'dashboard' },
      { id: '04-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '04-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '05-multi-node',
    title: '5. Cluster Multi-Nodo',
    file: '05-multi-node/README.md',
    icon: <TerminalIcon />,
    level: 'Avanzato',
    time: '15 min',
    sections: [
      { id: '05-01', title: 'Setup Multi-Nodo', anchor: 'creare-un-cluster-multi-nodo' },
      { id: '05-02', title: 'Gestione Nodi', anchor: 'aggiungere-nodi-a-un-cluster-esistente' },
      { id: '05-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '05-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '06-riassunto-comandi',
    title: '6. Riassunto Comandi',
    file: '06-riassunto-comandi/README.md',
    icon: <InventoryIcon />,
    level: 'Base',
    time: '10 min',
    sections: [
      { id: '06-01', title: 'Cheat Sheet', anchor: 'riassunto-dei-comandi-minikube' },
      { id: '06-ex', title: 'Esercizi di Ripasso', anchor: 'exercises-section' },
      { id: '06-quiz', title: 'Quiz di Ripasso', anchor: 'quiz-section' }
    ]
  },
  {
    id: '07-test-finale',
    title: '7. Esame Finale',
    file: '07-test-finale/README.md',
    icon: <ExamIcon />,
    level: 'Esame',
    time: '30 min',
    sections: [
      { id: '07-01', title: 'Challenge Finale', anchor: 'esame-finale-minikube-mastery' },
      { id: '07-ex', title: 'Coding Challenge', anchor: 'exercises-section' },
      { id: '07-quiz', title: 'Test di Certificazione', anchor: 'quiz-section' }
    ]
  }
];
