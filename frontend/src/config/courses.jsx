import React from 'react';
import { 
  RocketLaunch as K8sIcon,
  CloudQueue as CloudIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Terminal as TerminalIcon,
  Layers as LayersIcon,
  Architecture as ArchitectureIcon,
  Code as CodeIcon,
  Inventory2 as InventoryIcon,
  NetworkCheck as NetworkIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// Importiamo i moduli esistenti (che ora consideriamo parte del corso "Fondamentali Kubernetes")
import { modules as k8sModules } from './modules';

export const courses = [
  {
    id: 'k8s-fondamentali',
    title: 'Fondamentali Kube',
    description: 'Dalla gestione dei container con Docker all\'orchestrazione avanzata con Kubernetes e lo sviluppo di Operatori in Go.',
    duration: '4h 35min',
    icon: <K8sIcon sx={{ fontSize: 40, color: '#326ce5' }} />,
    modules: k8sModules,
    color: '#326ce5'
  },
  {
    id: 'docker-mastery',
    title: 'Docker Master',
    description: 'Approfondimento completo su Docker, ottimizzazione immagini, networking avanzato e Docker Compose per microservizi.',
    duration: '2h 15min',
    icon: <CloudIcon sx={{ fontSize: 40, color: '#2496ed' }} />,
    modules: [], // In arrivo
    color: '#2496ed',
    comingSoon: true
  },
  {
    id: 'cloud-native-security',
    title: 'Sicurezza Cloud',
    description: 'Best practices per mettere in sicurezza i carichi di lavoro in cloud, scansione vulnerabilità e compliance.',
    duration: '3h 10min',
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#f44336' }} />,
    modules: [], // In arrivo
    color: '#f44336',
    comingSoon: true
  }
];
