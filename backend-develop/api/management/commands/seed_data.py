import json
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models.MuscleModel import MuscleModel
from api.models.GYMLocationModel import GYMLocationModel
from api.models.EventTypeModel import EventTypeModel
from api.models.ExerciseModel import ExerciseModel
from api.models.ExerciseInstructionModel import ExerciseInstructionModel
from api.models.ExerciseMuscleRelation import ExerciseMuscleRelation
from api.models.TrainerModel import TrainerModel
from api.models.TrainerExerciseRelation import TrainerExerciseRelation
from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.SubscriptionTypeScopeModel import SubscriptionTypeScopeModel
from api.models.ExerciseAccessType import ExerciseAccessType
from api.models.ExerciseInstructionType import ExerciseInstructionType
from api.models.SubscriptionScopeType import SubscriptionScopeType


# ─── Мышцы ───────────────────────────────────────────────────────────────────

MUSCLES = [
    'Грудные', 'Широчайшие', 'Трапеции', 'Ромбовидные', 'Дельтовидные',
    'Бицепс', 'Трицепс', 'Предплечья', 'Пресс', 'Косые мышцы живота',
    'Квадрицепс', 'Бицепс бедра', 'Приводящие', 'Ягодицы', 'Икры',
]

# ─── Адреса залов ─────────────────────────────────────────────────────────────

GYM_LOCATIONS = [
    'Москва, ул. Арбат, 12',
    'Москва, Ленинский пр-т, 78',
    'Москва, ул. Тверская, 34',
    'Санкт-Петербург, Невский пр-т, 101',
    'Санкт-Петербург, ул. Рубинштейна, 5',
    'Казань, ул. Баумана, 44',
    'Екатеринбург, пр-т Ленина, 25',
    'Новосибирск, Красный пр-т, 17',
    'Краснодар, ул. Красная, 88',
    'Сочи, ул. Навагинская, 9',
]

# ─── Типы событий аналитики ───────────────────────────────────────────────────

EVENT_TYPES = [
    'app_open',
    'gym_view',
    'exercise_click',
    'exercise_view',
    'subscription_open',
    'subscription_buy_attempt',
    'subscription_buy_success',
    'subscription_cancel',
    'onboarding_start',
    'onboarding_complete',
    'login',
    'register',
    'profile_view',
    'deep_link_open',
]

# ─── Упражнения ───────────────────────────────────────────────────────────────

def editorjs(text: str) -> dict:
    """Минимальный валидный EditorJS JSON."""
    return {
        "time": 1746268800000,
        "version": "2.31.5",
        "blocks": [
            {"id": "block1", "type": "paragraph", "data": {"text": text}},
        ],
    }


EXERCISES = [
    # ── Грудь ──
    {
        'name': 'Жим штанги лёжа',
        'description': 'Базовое упражнение для грудных мышц. Лягте на горизонтальную скамью, возьмитесь за гриф чуть шире плеч.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Грудные', 'Трицепс', 'Дельтовидные'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Техника жима штанги лёжа', 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
                'Лягте на скамью. Возьмитесь за гриф хватом чуть шире плеч. Опустите штангу до касания груди, затем выжмите вверх. Не отрывайте поясницу от скамьи.'),
            ExerciseInstructionType.FEMALE: ('Жим штанги лёжа для женщин', 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
                'Используйте облегчённый вес. Сконцентрируйтесь на ощущении работы грудных мышц. Можно заменить грифом 20 кг.'),
        },
    },
    {
        'name': 'Жим гантелей лёжа',
        'description': 'Аналог штанги с большей амплитудой движения и независимой нагрузкой на каждую руку.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Грудные', 'Дельтовидные'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Жим гантелей — полная амплитуда', 'https://www.youtube.com/watch?v=VmB1G1K7v94',
                'Возьмите гантели, лягте на скамью. В нижней точке локти на уровне плеч. Жмите вверх, сводя гантели вместе в верхней точке.'),
        },
    },
    {
        'name': 'Разводка гантелей лёжа',
        'description': 'Изолирующее упражнение на грудь. Растягивает мышцы и улучшает их форму.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Грудные'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Техника разводки гантелей', 'https://www.youtube.com/watch?v=eozdVDA78K0',
                'Лягте на скамью с гантелями над грудью. Разводите руки в стороны до ощущения растяжки в груди, слегка сгибая локти. Возвращайте через дугу.'),
        },
    },
    {
        'name': 'Жим штанги под углом 30°',
        'description': 'Акцентирует нагрузку на верхнюю часть грудных мышц.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Грудные', 'Дельтовидные'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Инклайн-жим штанги', 'https://www.youtube.com/watch?v=jPLdzuHckI8',
                'Угол скамьи 30–45°. Гриф опускайте к верхней части груди. Не допускайте чрезмерного прогиба в пояснице.'),
        },
    },
    # ── Спина ──
    {
        'name': 'Тяга верхнего блока широким хватом',
        'description': 'Развивает широчайшие мышцы. Хорошая замена подтягиваниям для начинающих.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Широчайшие', 'Бицепс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Тяга верхнего блока — техника', 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
                'Сядьте, зафиксируйте бёдра под валиком. Тяните гриф к верхней части груди, сводя лопатки. Не отклоняйтесь назад более чем на 15°.'),
        },
    },
    {
        'name': 'Тяга нижнего блока к поясу',
        'description': 'Горизонтальная тяга для средней части спины. Развивает толщину спины.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Широчайшие', 'Ромбовидные', 'Трапеции'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Горизонтальная тяга — техника', 'https://www.youtube.com/watch?v=GZbfZ033f74',
                'Сидя, тяните рукоять к животу. Держите спину прямой. В конечной точке сводите лопатки. Медленно возвращайте вес.'),
        },
    },
    {
        'name': 'Тяга гантели одной рукой',
        'description': 'Унилатеральное упражнение для устранения мышечного дисбаланса.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Широчайшие', 'Ромбовидные', 'Бицепс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Тяга гантели в наклоне', 'https://www.youtube.com/watch?v=pYcpY20QaE8',
                'Обопритесь на скамью коленом и рукой. Тяните гантель к бедру, разворачивая корпус. Полностью опускайте руку вниз для растяжки.'),
        },
    },
    {
        'name': 'Гиперэкстензия',
        'description': 'Укрепляет разгибатели спины, ягодицы и бицепс бедра. Профилактика болей в пояснице.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Ромбовидные', 'Ягодицы', 'Бицепс бедра'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Техника гиперэкстензии', 'https://www.youtube.com/watch?v=ph3pddpKzzw',
                'Зафиксируйте ноги, опустите корпус вниз. Поднимайте до прямой линии тела — не переразгибайтесь. Руки за головой или скрещены на груди.'),
        },
    },
    # ── Плечи ──
    {
        'name': 'Жим гантелей стоя',
        'description': 'Базовое упражнение на дельтовидные мышцы. Развивает все три пучка.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Дельтовидные', 'Трицепс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Жим гантелей стоя — техника', 'https://www.youtube.com/watch?v=qEwKCR5JCog',
                'Стоя, гантели на уровне плеч ладонями вперёд. Жмите вверх до полного выпрямления рук. Не прогибайтесь в пояснице.'),
            ExerciseInstructionType.FEMALE: ('Жим гантелей для женщин', 'https://www.youtube.com/watch?v=qEwKCR5JCog',
                'Начните с лёгкого веса (3–5 кг). Выполняйте сидя для большей стабильности. Следите за дыханием.'),
        },
    },
    {
        'name': 'Подъём гантелей через стороны',
        'description': 'Изолирующее упражнение на средний пучок дельт. Формирует ширину плеч.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Дельтовидные'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Боковые подъёмы — техника', 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
                'Стоя, гантели вдоль тела. Поднимайте руки в стороны до уровня плеч, слегка согнув локти. Мизинец чуть выше большого пальца. Не раскачивайтесь.'),
        },
    },
    # ── Ноги ──
    {
        'name': 'Жим ногами в тренажёре',
        'description': 'Основное упражнение для квадрицепса. Безопасная альтернатива приседаниям.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Квадрицепс', 'Ягодицы', 'Бицепс бедра'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Жим ногами — полная техника', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
                'Сядьте в тренажёр, стопы на платформе. Опускайте до угла 90° в колене. Жмите не до полного выпрямления — держите колени чуть согнутыми.'),
            ExerciseInstructionType.FEMALE: ('Жим ногами для женщин — акцент на ягодицы', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
                'Поставьте ноги выше и шире — так нагрузка сместится на ягодицы. Глубже опускайте платформу для большей амплитуды.'),
        },
    },
    {
        'name': 'Разгибания ног в тренажёре',
        'description': 'Изолирующее упражнение на квадрицепс. Финальное «добивание» передней поверхности бедра.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Квадрицепс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Разгибания ног — техника', 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
                'Сядьте, голени под валиком. Разгибайте ноги до горизонтали. В верхней точке задержитесь на 1–2 секунды. Медленно опускайте.'),
        },
    },
    {
        'name': 'Сгибания ног лёжа',
        'description': 'Изолирующее упражнение для бицепса бедра. Необходимо для гармоничного развития ног.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Бицепс бедра'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Сгибания ног лёжа — техника', 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
                'Лягте лицом вниз, голени под валиком. Сгибайте ноги до угла ~90°. Бёдра прижаты к скамье. Выполняйте медленно, контролируя вес.'),
        },
    },
    {
        'name': 'Выпады с гантелями',
        'description': 'Функциональное упражнение для ног и ягодиц. Улучшает баланс и координацию.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Квадрицепс', 'Ягодицы', 'Приводящие'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Выпады — классическая техника', 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
                'Стоя, шаг вперёд. Опустите заднее колено почти до пола. Переднее колено не выходит за носок. Оттолкнитесь передней ногой и вернитесь в исходное положение.'),
            ExerciseInstructionType.FEMALE: ('Выпады для ягодиц — женский вариант', 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
                'Делайте более широкий шаг — это усилит нагрузку на ягодицы. Можно выполнять без гантелей первое время.'),
        },
    },
    {
        'name': 'Подъём на носки стоя',
        'description': 'Развивает икроножные мышцы. Выполняется медленно с паузой в верхней точке.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Икры'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Подъём на носки — техника', 'https://www.youtube.com/watch?v=-M4-G8p1fCI',
                'Стоя на краю ступени, пятки свисают. Поднимитесь на носки, задержитесь 1 секунду. Медленно опустите пятки ниже уровня ступени для полной растяжки.'),
        },
    },
    # ── Руки ──
    {
        'name': 'Подъём штанги на бицепс',
        'description': 'Классическое упражнение для бицепса. Формирует объём и пик мышцы.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Бицепс', 'Предплечья'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Подъём штанги на бицепс — техника', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
                'Стоя, хват снизу, руки на ширине плеч. Сгибайте руки до полного сокращения бицепса. Не раскачивайте корпус. Медленно опускайте штангу.'),
        },
    },
    {
        'name': 'Французский жим',
        'description': 'Изолирующее упражнение на трицепс. Эффективно для проработки длинной головки.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Трицепс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Французский жим — техника', 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
                'Лёжа на скамье, штанга над грудью на вытянутых руках. Опускайте гриф ко лбу, сгибая только локти. Верните в исходное положение. Локти неподвижны.'),
        },
    },
    # ── Кор / Пресс ──
    {
        'name': 'Скручивания на пресс',
        'description': 'Базовое упражнение для прямой мышцы живота.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Пресс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Скручивания — техника', 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
                'Лёжа на спине, ноги согнуты. Руки за головой, не тяните за шею. Поднимайте плечи от пола, сокращая пресс. Дышите: выдох вверху.'),
        },
    },
    {
        'name': 'Подъём ног в висе',
        'description': 'Мощное упражнение на нижний пресс и сгибатели бёдер.',
        'access_type': ExerciseAccessType.PAID,
        'muscles': ['Пресс', 'Косые мышцы живота'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Подъём ног в висе — техника', 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
                'Повисните на перекладине. Поднимайте прямые ноги до угла 90°. Для упрощения — сгибайте ноги в коленях. Не раскачивайтесь.'),
        },
    },
    {
        'name': 'Боковые скручивания',
        'description': 'Прорабатывает косые мышцы живота. Формирует талию.',
        'access_type': ExerciseAccessType.FREE,
        'muscles': ['Косые мышцы живота', 'Пресс'],
        'instructions': {
            ExerciseInstructionType.ALL: ('Боковые скручивания — техника', 'https://www.youtube.com/watch?v=ye4NB5PnRlM',
                'Лёжа на боку, рука за головой. Поднимайте плечо к бедру, сокращая боковые мышцы. Не тяните за шею. 15–20 повторений на каждую сторону.'),
        },
    },
]

# ─── Тренажёры ────────────────────────────────────────────────────────────────

TRAINERS = [
    {
        'name': 'Силовая скамья',
        'description': 'Регулируемая скамья для жимов и разводок. Позволяет работать под разными углами.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Жим штанги лёжа', 'Жим гантелей лёжа', 'Разводка гантелей лёжа',
            'Жим штанги под углом 30°', 'Французский жим',
        ],
    },
    {
        'name': 'Блочный тренажёр',
        'description': 'Верхний и нижний блок в одном. Незаменим для проработки спины и рук.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Тяга верхнего блока широким хватом', 'Тяга нижнего блока к поясу',
            'Тяга гантели одной рукой',
        ],
    },
    {
        'name': 'Жим ног',
        'description': 'Тренажёр для развития квадрицепса, задней поверхности бедра и ягодиц.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Жим ногами в тренажёре', 'Разгибания ног в тренажёре',
            'Сгибания ног лёжа', 'Выпады с гантелями',
        ],
    },
    {
        'name': 'Плечевой тренажёр',
        'description': 'Изолирует дельтовидные мышцы. Подходит для прессов и подъёмов.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Жим гантелей стоя', 'Подъём гантелей через стороны',
        ],
    },
    {
        'name': 'Тренажёр для ног (икры)',
        'description': 'Специализированный тренажёр для икроножных мышц.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Подъём на носки стоя', 'Жим ногами в тренажёре',
        ],
    },
    {
        'name': 'Тренажёр для пресса',
        'description': 'Позволяет эффективно проработать все области мышц кора.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Скручивания на пресс', 'Подъём ног в висе', 'Боковые скручивания',
        ],
    },
    {
        'name': 'Гиперэкстензия',
        'description': 'Тренажёр для разгибателей спины. Профилактика болей в пояснице.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': ['Гиперэкстензия'],
    },
    {
        'name': 'Тренажёр для бицепса',
        'description': 'Изолирующий тренажёр, фиксирующий плечо для чистой работы бицепса.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Подъём штанги на бицепс', 'Тяга гантели одной рукой',
        ],
    },
    {
        'name': 'Кроссовер',
        'description': 'Блочный кроссовер с двумя независимыми колоннами. Множество вариаций упражнений.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Разводка гантелей лёжа', 'Боковые скручивания',
            'Тяга верхнего блока широким хватом',
        ],
    },
    {
        'name': 'Многофункциональная стойка',
        'description': 'Силовая рама для приседаний, жимов и подтягиваний. Базовый тренажёр зала.',
        'photo': 'trainers/placeholder.png',
        'exercise_names': [
            'Жим штанги лёжа', 'Жим штанги под углом 30°',
            'Выпады с гантелями', 'Подъём ног в висе',
        ],
    },
]

# ─── Типы подписок ────────────────────────────────────────────────────────────

SUBSCRIPTION_TYPES = [
    {'name': '1 день (пробный)',  'description': 'Тестовый доступ на 1 день.',        'price': '99.00',    'days': 1,   'scope': SubscriptionScopeType.ALL},
    {'name': '1 неделя',          'description': 'Недельный доступ ко всем планам.',   'price': '299.00',   'days': 7,   'scope': SubscriptionScopeType.ALL},
    {'name': '1 месяц',           'description': 'Доступ на 30 дней.',                 'price': '990.00',   'days': 30,  'scope': SubscriptionScopeType.ALL},
    {'name': '3 месяца',          'description': 'Квартальный доступ. Выгода 15%.',    'price': '2490.00',  'days': 90,  'scope': SubscriptionScopeType.ALL},
    {'name': '6 месяцев',         'description': 'Полугодовой доступ. Выгода 25%.',    'price': '4490.00',  'days': 180, 'scope': SubscriptionScopeType.ALL},
    {'name': '1 год',             'description': 'Годовой доступ. Максимальная выгода.', 'price': '7990.00', 'days': 365, 'scope': SubscriptionScopeType.ALL},
    {'name': '2 года',            'description': 'Долгосрочный доступ на 2 года.',     'price': '13990.00', 'days': 730, 'scope': SubscriptionScopeType.ALL},
]


class Command(BaseCommand):
    help = 'Полное заполнение БД тестовыми данными'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Очистить данные перед заполнением')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            self._clear()

        muscle_map = self._seed_muscles()
        self._seed_gym_locations()
        self._seed_event_types()
        exercise_map = self._seed_exercises(muscle_map)
        self._seed_trainers(exercise_map)
        self._seed_subscription_types()

        self.stdout.write(self.style.SUCCESS('\n✓ База данных полностью заполнена.'))

    # ── helpers ──────────────────────────────────────────────────────────────

    def _clear(self):
        self.stdout.write(self.style.WARNING('Очистка данных...'))
        SubscriptionTypeScopeModel.objects.all().delete()
        SubscriptionTypeModel.objects.all().delete()
        TrainerExerciseRelation.objects.all().delete()
        ExerciseMuscleRelation.objects.all().delete()
        ExerciseInstructionModel.objects.all().delete()
        TrainerModel.objects.all().delete()
        ExerciseModel.objects.all().delete()
        MuscleModel.objects.all().delete()
        GYMLocationModel.objects.all().delete()
        EventTypeModel.objects.all().delete()
        self.stdout.write(self.style.WARNING('  Данные очищены.\n'))

    def _seed_muscles(self):
        self.stdout.write('Мышцы...')
        muscle_map = {}
        for name in MUSCLES:
            obj, _ = MuscleModel.objects.get_or_create(name=name)
            muscle_map[name] = obj
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(muscle_map)} групп мышц'))
        return muscle_map

    def _seed_gym_locations(self):
        self.stdout.write('Адреса залов...')
        count = 0
        for address in GYM_LOCATIONS:
            _, created = GYMLocationModel.objects.get_or_create(address=address)
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} новых адресов (всего {GYMLocationModel.objects.count()})'))

    def _seed_event_types(self):
        self.stdout.write('Типы событий аналитики...')
        count = 0
        for name in EVENT_TYPES:
            _, created = EventTypeModel.objects.get_or_create(name=name)
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} новых типов (всего {EventTypeModel.objects.count()})'))

    def _seed_exercises(self, muscle_map):
        self.stdout.write('Упражнения...')
        exercise_map = {}
        for ex_data in EXERCISES:
            exercise, created = ExerciseModel.objects.get_or_create(
                name=ex_data['name'],
                defaults={
                    'description': ex_data['description'],
                    'access_type': ex_data['access_type'],
                },
            )
            exercise_map[ex_data['name']] = exercise

            if created:
                # Мышцы
                for muscle_name in ex_data['muscles']:
                    ExerciseMuscleRelation.objects.get_or_create(
                        exercise=exercise,
                        muscle=muscle_map[muscle_name],
                    )
                # Инструкции
                for instr_type, (desc, video_url, text) in ex_data.get('instructions', {}).items():
                    ExerciseInstructionModel.objects.get_or_create(
                        exercise=exercise,
                        type=instr_type,
                        defaults={
                            'description': desc,
                            'video_url': video_url,
                            'instruction': editorjs(text),
                        },
                    )
        created_count = sum(1 for e in EXERCISES if ExerciseModel.objects.filter(name=e['name']).exists())
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(exercise_map)} упражнений с инструкциями'))
        return exercise_map

    def _seed_trainers(self, exercise_map):
        self.stdout.write('Тренажёры...')
        count = 0
        for t_data in TRAINERS:
            trainer, created = TrainerModel.objects.get_or_create(
                name=t_data['name'],
                defaults={
                    'description': t_data['description'],
                    'photo': t_data['photo'],
                },
            )
            if created:
                count += 1
                for ex_name in t_data['exercise_names']:
                    exercise = exercise_map.get(ex_name)
                    if exercise:
                        TrainerExerciseRelation.objects.get_or_create(
                            trainer=trainer, exercise=exercise,
                        )
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} новых тренажёров (всего {TrainerModel.objects.count()})'))

    def _seed_subscription_types(self):
        self.stdout.write('Типы подписок...')
        count = 0
        for s_data in SUBSCRIPTION_TYPES:
            sub, created = SubscriptionTypeModel.objects.get_or_create(
                name=s_data['name'],
                defaults={
                    'description': s_data['description'],
                    'price': s_data['price'],
                    'access_duration_in_days': s_data['days'],
                    'scope_type': s_data['scope'],
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} новых планов (всего {SubscriptionTypeModel.objects.count()})'))
