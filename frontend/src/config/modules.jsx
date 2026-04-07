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
} from '@mui/icons-material';

export const introModule = {
  id: 'intro',
  title: 'Benvenuto',
  file: 'intro.md',
  icon: <SchoolIcon />,
  sections: [
    { id: 'intro-01', title: 'La Roadmap', anchor: 'la-roadmap' },
    { id: 'intro-02', title: 'Come Usare', anchor: 'come-usare-questo-repository' },
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
      { id: '01-08', title: 'Volumi e Dati', anchor: 'gestione-dei-dati-volumi-bind-mounts-e-tmpfs' },
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
      { id: '02-01', title: 'Il Control Plane', anchor: 'il-control-plane-il-cervello' },
      { id: '02-02', title: 'I Nodi Worker', anchor: 'worker-nodes-le-braccia' },
      { id: '02-03', title: 'Interfacce X-RI', anchor: 'le-interfacce-standard-x-ri' },
      { id: '02-04', title: 'Labels & Namespaces', anchor: 'concetti-di-base-degli-oggetti' },
      { id: '02-05', title: 'Kubectl Pratico', anchor: 'esercizi-pratici-con-kubectl' },
      { id: '02-06', title: 'Il giro di un Pod', anchor: 'approfondimento-il-giro-di-un-pod' },
      { id: '02-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '02-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '03-01', title: 'Anatomia YAML', anchor: 'anatomia-di-un-file-yaml' },
      { id: '03-02', title: 'Il Pod', anchor: '1-il-pod-lunità-atomica' },
      { id: '03-03', title: 'Deployment', anchor: '2-deployment-gestione-del-ciclo-di-vita' },
      { id: '03-04', title: 'Service', anchor: '3-service-networking-stabile' },
      { id: '03-05', title: 'ConfigMap & Secret', anchor: '4-configmap--secret-configurazione-esterna' },
      { id: '03-06', title: 'Comandi Essenziali', anchor: 'comandi-essenziali-per-le-risorse' },
      { id: '03-07', title: 'Esercizio Pratico', anchor: 'esercizio-pratico' },
      { id: '03-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '03-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '04-01', title: 'Service Discovery', anchor: '1-service-discovery--dns' },
      { id: '04-02', title: 'Ingress', anchor: '2-ingress-il-gateway-intelligente' },
      { id: '04-03', title: 'Network Policies', anchor: '3-network-policies-il-firewall-nativo' },
      { id: '04-04', title: 'Endpoints', anchor: '4-endpoints--endpointslices' },
      { id: '04-05', title: 'CNI e Plugin', anchor: '5-cni-container-network-interface' },
      { id: '04-06', title: 'Debugging Rete', anchor: 'debugging-del-networking' },
      { id: '04-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '04-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '05-02', title: 'Access Modes', anchor: '2-modalità-di-accesso-access-modes' },
      { id: '05-03', title: 'StorageClasses', anchor: '3-storageclasses-e-provisioning-dinamico' },
      { id: '05-04', title: 'Binding Mode', anchor: '4-volume-binding-mode' },
      { id: '05-05', title: 'emptyDir', anchor: '5-volumi-temporanei-emptydir' },
      { id: '05-06', title: 'Comandi Storage', anchor: 'comandi-per-lo-storage' },
      { id: '05-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '05-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '06-01', title: 'Authn vs Authz', anchor: '1-autenticazione-vs-autorizzazione' },
      { id: '06-02', title: 'RBAC Fondamentali', anchor: '2-rbac-role-based-access-control' },
      { id: '06-03', title: 'ServiceAccounts', anchor: '3-serviceaccounts-lidentità-dei-pod' },
      { id: '06-04', title: 'Security Context', anchor: '4-security-context-sicurezza-del-container' },
      { id: '06-05', title: 'Pod Security (PSA)', anchor: '5-pod-security-admission-psa' },
      { id: '06-06', title: 'Comandi Sicurezza', anchor: 'comandi-per-la-sicurezza' },
      { id: '06-07', title: 'Esercizio Pratico', anchor: 'esercizio-pratico' },
      { id: '06-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '06-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '07-02', title: 'Anatomia Chart', anchor: '2-anatomia-di-una-chart' },
      { id: '07-03', title: 'Gestione Release', anchor: '3-gestione-delle-release' },
      { id: '07-04', title: 'Basi Templating', anchor: '4-basi-del-templating' },
      { id: '07-05', title: 'Debugging Chart', anchor: 'debugging-delle-chart' },
      { id: '07-06', title: 'Esercizio Pratico', anchor: 'esercizio-pratico' },
      { id: '07-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '07-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
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
      { id: '08-01', title: 'Cos\'è una CRD?', anchor: '1-custom-resource-definitions-crds' },
      { id: '08-02', title: 'Reconciliation Loop', anchor: '2-il-reconciliation-loop-ciclo-di-riconciliazione' },
      { id: '08-03', title: 'Operator Pattern', anchor: '3-loperator-pattern' },
      { id: '08-04', title: 'Sviluppo in Go', anchor: '4-sviluppo-in-go-client-go-e-frameworks' },
      { id: '08-05', title: 'Strumenti Dev', anchor: 'strumenti-di-sviluppo' },
      { id: '08-06', title: 'Esercizio Avanzato', anchor: 'esercizio-avanzato' },
      { id: '08-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '08-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '09',
    title: '9. Cheat Sheet Comandi',
    file: '09.md',
    icon: <TerminalIcon />,
    level: 'Base',
    time: '10 min',
    sections: [
      { id: '09-01', title: 'Docker Essentials', anchor: '1-fondamentali-docker' },
      { id: '09-02', title: 'Kube Essentials', anchor: '2-architettura-e-esplorazione' },
      { id: '09-03', title: 'Risorse e Networking', anchor: '3-gestione-risorse' },
      { id: '09-04', title: 'Helm e Operatori', anchor: '7-helm' },
      { id: '09-ex', title: 'Esercizi Interattivi', anchor: 'exercises-section' },
      { id: '09-quiz', title: 'Quiz Finale', anchor: 'quiz-section' }
    ]
  },
  {
    id: '10',
    title: '10. Esame Finale',
    file: '10.md',
    icon: <ExamIcon />,
    level: 'Avanzato',
    time: '45 min',
    sections: [
      { id: '10-01', title: 'Struttura Esame', anchor: 'struttura-dellesame' },
      { id: '10-02', title: 'Consigli', anchor: 'consigli-per-lesame' },
      { id: '10-ex', title: 'Mega Quizzone', anchor: 'quiz-section' },
      { id: '10-quiz', title: 'Sfide Finali', anchor: 'exercises-section' }
    ]
  },
];
