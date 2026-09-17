#!/usr/bin/env python3
"""
Normalize quiz.json and exercises.json in project_public/ (and project_private/)
to the CANONICAL schema consumed by backend/src/controllers/moduleController.js:

  quiz.json       -> {"quiz": [ {question:{it,en}, options:[...], correct:<idx>, explanation:{it,en}} ]}
  exercises.json  -> {"exercises": [ {title:{it,en}, description:{it,en}, hint:{it,en}, <content keys preserved>} ]}

Converts in place:
  - bare array                      -> wrapped in {"quiz"/"exercises": [...]}
  - root "questions" key            -> renamed "quiz"
  - flat "question"+"question_en"   -> merged {it,en}
  - any remaining flat string title/question/explanation/etc -> wrapped {it,en}
  - "correct_answer"                -> renamed "correct" (when "correct" absent)
  - options containing any {it,en}  -> all options normalized to {it,en}

Preserves a root "quiz" block nested inside exercises.json (k8s-fondamentali pattern).
Drop-in: dry-run with --dry-run prints a plan without writing.

Run:  python3 scripts/normalize_course_data.py [--dry-run] [--root PATH]
"""

import json
import os
import sys

LOCALIZABLE_STR = ('question', 'explanation', 'title', 'description',
                   'hint', 'objective')

LOCALIZABLE_PAIR = {
    'question': 'question_en',
    'explanation': 'explanation_en',
    'title': 'title_en',
    'description': 'description_en',
    'hint': 'hint_en',
}


def merge_l10n(item):
    """Return (fixed_item, changed). Normalize all localizable fields."""
    changed = False
    out = dict(item)

    for base, en_key in LOCALIZABLE_PAIR.items():
        if base not in out:
            continue
        val = out[base]
        en_val = out.get(en_key)

        if isinstance(val, dict):
            # already localized; drop any stray _en twin
            if en_key in out:
                del out[en_key]
                changed = True
            continue

        if isinstance(val, str):
            if en_val and isinstance(en_val, str):
                out[base] = {'it': val, 'en': en_val}
            else:
                out[base] = {'it': val, 'en': val}
            changed = True
        if en_key in out:
            del out[en_key]
            changed = True

    # correct_answer -> correct
    if 'correct_answer' in out and 'correct' not in out:
        out['correct'] = out.pop('correct_answer')
        changed = True
    elif 'correct_answer' in out:
        del out['correct_answer']
        changed = True

    # options: homogenize (any dict -> all dicts)
    if isinstance(out.get('options'), list) and out['options']:
        opts = out['options']
        if any(isinstance(o, dict) for o in opts):
            new_opts = []
            for o in opts:
                if isinstance(o, str):
                    new_opts.append({'it': o, 'en': o})
                    changed = True
                else:
                    new_opts.append(o)
            out['options'] = new_opts

    return out, changed


def normalize_mc_list(items):
    changed = False
    norm = []
    for it in items:
        if not isinstance(it, dict):
            continue
        fixed, c = merge_l10n(it)
        changed = changed or c
        norm.append(fixed)
    return norm, changed


def normalize_quiz(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict) and 'questions' in data:
        items = data['questions']
        kind = 'B'
    elif isinstance(data, list):
        items = data
        kind = 'C/D'
    elif isinstance(data, dict) and 'quiz' in data:
        items = data['quiz']
        kind = 'A'
    else:
        return None  # nothing to do / unknown

    norm, changed = normalize_mc_list(items)
    out = {'quiz': norm}
    if changed or kind != 'A':
        return out, kind
    return None


def normalize_exercises(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    root_quiz = None
    if isinstance(data, list):
        items = data
        kind = 'bare'
    elif isinstance(data, dict):
        items = data.get('exercises', [])
        root_quiz = data.get('quiz')
        kind = 'dict'
    else:
        return None

    norm, changed = normalize_mc_list(items)

    out = {}
    if root_quiz is not None:
        q_norm, q_changed = normalize_mc_list(root_quiz)
        out['quiz'] = q_norm
        changed = changed or q_changed
    out['exercises'] = norm

    if changed or kind == 'bare':
        return out
    # dict form already canonical with no _en leftovers
    return None


def main():
    dry = '--dry-run' in sys.argv
    root = 'project_public'
    for arg in sys.argv:
        if arg.startswith('--root='):
            root = arg.split('=', 1)[1]

    plan_quiz = []
    plan_ex = []
    for course in sorted(os.listdir(root)):
        course_dir = os.path.join(root, course)
        if not os.path.isdir(course_dir):
            continue
        for mod in sorted(os.listdir(course_dir)):
            mod_dir = os.path.join(course_dir, mod)
            if not os.path.isdir(mod_dir):
                continue
            qf = os.path.join(mod_dir, 'quiz.json')
            if os.path.exists(qf):
                res = normalize_quiz(qf)
                if res:
                    plan_quiz.append((qf, res))
            ef = os.path.join(mod_dir, 'exercises.json')
            if os.path.exists(ef):
                res = normalize_exercises(ef)
                if res:
                    plan_ex.append((ef, res))

    if dry:
        print('DRY RUN — modifiche previste:')
        for p, (_, kind) in plan_quiz:
            print(f'  quiz.json      {p}  (schema {kind})')
        for p in plan_ex:
            print(f'  exercises.json {p}')
        print(f'\nTotale: {len(plan_quiz)} quiz, {len(plan_ex)} exercises da normalizzare')
        return 0

    for p, (out, kind) in plan_quiz:
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f'quiz.json      {p}  (schema {kind})')

    for p, out in plan_ex:
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f'exercises.json {p}')

    print(f'\nNormalizzati: {len(plan_quiz)} quiz, {len(plan_ex)} exercises')
    return 0


if __name__ == '__main__':
    sys.exit(main())