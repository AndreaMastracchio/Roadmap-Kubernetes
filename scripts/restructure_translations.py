#!/usr/bin/env python3
"""
Restructure quiz.json and exercises.json with inline translations.
- question/explanation → {it: "...", en: "..."}  (quiz)
- title/description → {it: "...", en: "..."}  (exercises)
- options/correct/difficulty/domain stay as-is (identical across languages)
- hints stay as-is (commands, identical)
"""

import json
import os
import glob
import sys
import shutil
from datetime import datetime

QUIZ_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def restructure_quiz(filepath):
    """Restructure quiz.json: wrap question and explanation in {it, en}."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    quiz_list = data.get('quiz', data) if isinstance(data, dict) else data
    if not isinstance(quiz_list, list):
        return 0
    
    changed = 0
    for q in quiz_list:
        # Skip if already restructured (en key exists)
        if isinstance(q.get('question'), dict) and 'en' in q['question']:
            continue
        
        # Wrap question
        if isinstance(q.get('question'), str):
            q['question'] = {'it': q['question'], 'en': q['question']}
            changed += 1
        
        # Wrap explanation
        if isinstance(q.get('explanation'), str):
            q['explanation'] = {'it': q['explanation'], 'en': q['explanation']}
    
    if changed > 0:
        output = {'quiz': quiz_list} if isinstance(data, dict) and 'quiz' in data else quiz_list
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
    
    return changed

def restructure_exercises(filepath):
    """Restructure exercises.json: wrap title and description in {it, en}."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    ex_list = data.get('exercises', data) if isinstance(data, dict) else data
    if not isinstance(ex_list, list):
        return 0
    
    changed = 0
    for ex in ex_list:
        # Skip if already restructured
        if isinstance(ex.get('title'), dict) and 'en' in ex['title']:
            continue
        
        # Wrap title
        if isinstance(ex.get('title'), str):
            ex['title'] = {'it': ex['title'], 'en': ex['title']}
            changed += 1
        
        # Wrap description
        if isinstance(ex.get('description'), str):
            ex['description'] = {'it': ex['description'], 'en': ex['description']}
    
    if changed > 0:
        output = {'exercises': ex_list} if isinstance(data, dict) and 'exercises' in data else ex_list
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
    
    return changed

def main():
    base = os.path.join(QUIZ_DIR, 'project_private')
    modules = sorted(
        glob.glob(os.path.join(base, 'k8s-administrator-cka', '0[2-9]-*')) +
        glob.glob(os.path.join(base, 'k8s-security-cks', '[0-9]*'))
    )
    
    # Skip CKA 01 (already done)
    modules = [m for m in modules if '01-cluster-installation' not in m]
    
    total_quiz = 0
    total_ex = 0
    
    for mod in modules:
        name = os.path.basename(mod)
        
        qf = os.path.join(mod, 'quiz.json')
        if os.path.exists(qf):
            n = restructure_quiz(qf)
            total_quiz += n
            if n:
                print(f'  {name}/quiz.json: {n} questions restructured')
        
        ef = os.path.join(mod, 'exercises.json')
        if os.path.exists(ef):
            n = restructure_exercises(ef)
            total_ex += n
            if n:
                print(f'  {name}/exercises.json: {n} exercises restructured')
    
    print(f'\nTotal: {total_quiz} quiz questions, {total_ex} exercises restructured')

if __name__ == '__main__':
    main()
