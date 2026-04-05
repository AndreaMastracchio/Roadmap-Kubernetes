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
} from '@mui/icons-material';

export const introModule = {
  id: 'intro',
  title: 'Benvenuto',
  file: 'intro.md',
  icon: <SchoolIcon />,
  sections: [
    { id: 'intro-01', title: 'La Roadmap', anchor: 'la-roadmap' },
    { id: 'intro-02', title: 'Come Usare', anchor: 'come-usare-questo-repository' },
    { id: 'intro-03', title: 'Gestione CLI', anchor: 'gestione-rapida-cli' },
    { id: 'intro-04', title: 'Piattaforma Web', anchor: 'piattaforma-web-docker' }
  ]
};

export const modules = [
  {
    id: '01',
    title: '1. Fondamentali',
    file: '01.md',
    icon: <LayersIcon />,
    level: 'Base',
    time: '25 min',
    sections: [
      { id: '01-01', title: 'Perché i Container?', anchor: 'perché-i-container' },
      { id: '01-02', title: 'VM vs Container', anchor: 'container-vs-macchine-virtuali-vm' },
      { id: '01-03', title: 'Sotto il cofano', anchor: 'come-funziona-un-container-sotto-il-cofano' },
      { id: '01-04', title: 'Concetti Chiave', anchor: 'concetti-chiave' },
      { id: '01-05', title: 'Docker e Dockerfile', anchor: 'docker-e-dockerfile' },
      { id: '01-05b', title: 'ENTRYPOINT vs CMD', anchor: 'entrypoint-vs-cmd' },
      { id: '01-05c', title: 'COPY vs ADD', anchor: 'copy-vs-add' },
      { id: '01-08', title: 'Volumi e Dati', anchor: 'gestione-dei-dati-volumi-e-bind-mounts' },
      { id: '01-09', title: 'Reti Docker', anchor: 'reti-docker' },
      { id: '01-06', title: 'Sicurezza', anchor: 'sicurezza-dei-container' },
      { id: '01-07', title: 'Esercizi Pratici', anchor: 'esercizi-pratici' },
      { id: '01-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '01-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '02',
    title: '2. Architettura',
    file: '02.md',
    icon: <ArchitectureIcon />,
    level: 'Intermedio',
    time: '30 min',
    sections: [
      { id: '02-01', title: 'Control Plane e Nodi', anchor: 'il-cluster-control-plane-e-nodi' },
      { id: '02-02', title: 'Interagire col Cluster', anchor: 'come-interagire-con-il-cluster' },
      { id: '02-03', title: 'Strumenti Locali Consigliati', anchor: 'strumenti-locali-consigliati' },
      { id: '02-04', title: 'Esercizio', anchor: 'consiglio-per-lo-studio' }
    ]
  },
  {
    id: '03',
    title: '3. Risorse Base',
    file: '03.md',
    icon: <InventoryIcon />,
    level: 'Base',
    time: '25 min',
    sections: [
      { id: '03-01', title: 'Il Pod', anchor: '1-il-pod-l-unità-atomica' },
      { id: '03-02', title: 'Deployment', anchor: '2-deployment-gestione-del-ciclo-di-vita' },
      { id: '03-03', title: 'Service', anchor: '3-service-networking-stabile' },
      { id: '03-04', title: 'ConfigMap & Secret', anchor: '4-configmap-secret-configurazione-esterna' },
      { id: '03-05', title: 'Esercizio', anchor: 'esercizio-pratico' }
    ]
  },
  {
    id: '04',
    title: '4. Networking',
    file: '04.md',
    icon: <NetworkIcon />,
    level: 'Avanzato',
    time: '40 min',
    sections: [
      { id: '04-01', title: 'Ingress', anchor: '1-ingress-il-reverse-proxy-intelligente' },
      { id: '04-02', title: 'Network Policies', anchor: '2-network-policies-il-firewall-dei-pod' },
      { id: '04-03', title: 'CNI', anchor: '3-cni-container-network-interface' },
      { id: '04-04', title: 'Esercizio', anchor: 'esercizio-pratico' }
    ]
  },
  {
    id: '05',
    title: '5. Storage',
    file: '05.md',
    icon: <StorageIcon />,
    level: 'Intermedio',
    time: '30 min',
    sections: [
      { id: '05-01', title: 'PV e PVC', anchor: '1-il-ciclo-dello-storage-pv-e-pvc' },
      { id: '05-02', title: 'Access Modes', anchor: '2-access-modes-modalità-di-accesso' },
      { id: '05-03', title: 'StorageClasses', anchor: '3-storageclasses-e-provisioning-dinamico' },
      { id: '05-04', title: 'Esercizio', anchor: 'esercizio-pratico' }
    ]
  },
  {
    id: '06',
    title: '6. Sicurezza',
    file: '06.md',
    icon: <SecurityIcon />,
    level: 'Avanzato',
    time: '35 min',
    sections: [
      { id: '06-01', title: 'RBAC', anchor: '1-rbac-role-based-access-control' },
      { id: '06-02', title: 'ServiceAccounts', anchor: '2-serviceaccounts-l-identità-dei-pod' },
      { id: '06-03', title: 'Pod Security', anchor: '3-sicurezza-dei-container-pod-security-standards' },
      { id: '06-04', title: 'Esercizio', anchor: 'esercizio-pratico' }
    ]
  },
  {
    id: '07',
    title: '7. Helm',
    file: '07.md',
    icon: <TerminalIcon />,
    level: 'Intermedio',
    time: '20 min',
    sections: [
      { id: '07-01', title: 'Perché Helm?', anchor: '1-perché-usare-helm' },
      { id: '07-02', title: 'Componenti Chart', anchor: '2-i-componenti-di-una-chart' },
      { id: '07-03', title: 'Comandi', anchor: '3-comandi-essenziali' },
      { id: '07-04', title: 'Esercizio', anchor: 'esercizio-pratico' }
    ]
  },
  {
    id: '08',
    title: '8. Operatori Go',
    file: '08.md',
    icon: <CodeIcon />,
    level: 'Avanzato',
    time: '60 min',
    sections: [
      { id: '08-01', title: 'CRDs', anchor: '1-custom-resource-definitions-crds' },
      { id: '08-02', title: 'Reconciliation Loop', anchor: '2-il-reconciliation-loop-ciclo-di-riconciliazione' },
      { id: '08-03', title: 'Perché Go?', anchor: '3-perché-go' },
      { id: '08-04', title: 'Esercizio', anchor: 'esercizio-avanzato' }
    ]
  },
];
