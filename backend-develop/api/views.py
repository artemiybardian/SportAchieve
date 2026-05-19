import traceback
from typing import Optional, Any, List
import uuid

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.db import transaction
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from ninja import NinjaAPI
from ninja.security import HttpBearer

from api.models.ExerciseAccessType import ExerciseAccessType
from api.models.ExerciseInstructionModel import ExerciseInstructionModel
from api.models.ExerciseInstructionType import ExerciseInstructionType
from api.models.SubscriptionInvoiceModel import SubscriptionInvoiceModel
from api.models.SubscriptionModel import SubscriptionModel
from api.models.TelegramUserModel import TelegramUser
from api.models.EventLogModel import EventLogModel
from api.models.EventTypeModel import EventTypeModel
from api.models.InvoiceModel import InvoiceModel
from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.InvoiceStatus import InvoiceStatus
from api.models.TrainerExerciseRelation import TrainerExerciseRelation
from api.models.UserPaymentMethodModel import UserPaymentMethodModel
from api.models.YooKasaWebhookLogModel import YooKasaWebhookLogModel
from api.models.TrainerModel import TrainerModel
from api.models.ExerciseModel import ExerciseModel
from api.models.SubscriptionTypeScopeModel import SubscriptionTypeScopeModel
from api.models.SubscriptionScopeType import SubscriptionScopeType
from api.schemas.auth import RegisterSchema, LoginSchema, MeSchema
from api.schemas.event_log import EventLogSchema, EventLogCreateSchema
from api.schemas.event_type import EventTypeSchema
from api.schemas.invoice import InvoiceSchema, InvoiceCreateSchema, UserInvoice
from api.schemas.invoice_type import InvoiceTypeSchema
from api.schemas.max_profile import MaxProfileSyncSchema
from api.schemas.max_qr import MaxQrResolveSchema
from api.schemas.trainer import TrainerSchema
from api.schemas.exercise import ExerciseSchema, ExerciseCardSchema
from api.schemas.subscription import SubscriptionSchema
from api.schemas.response import MessageResponse, TokenResponse
from api.schemas.vk_qr import VkQrResolveSchema
from api.max_qr_token import lookup_max_qr_trainer_gym
from api.vk_qr_token import lookup_vk_qr_trainer_gym
from api.schemas.user import UserSchema
from api.schemas.vk_profile import VkProfileSyncSchema
from api.services.ExerciseAccessService import ExerciseAccessService
from api.services.JWTService import JWTService
from api.services.UserService import UserService
from api import user_messages as UM
from main.utils import build_absolute_uri
from max.MaxValidation import MaxValidation
from telegram.TelegramValidation import TelegramValidation
from vk.VKValidation import VKValidation
from yookasa.YookasaClient import YookasaClient
import logging

logger = logging.getLogger(__name__)


# Create your views here.
api = NinjaAPI(
	docs_decorator=staff_member_required,
	title="Sport Achieve API",
)


@api.exception_handler(Exception)
def global_exception_handler(request, exc):
	logger.error(f"Unhandled exception: {exc}", exc_info=True)
	return api.create_response(
		request,
		{"message": UM.INTERNAL_ERROR},
		status=500,
	)

tg_app_data_validation = TelegramValidation(
	telegram_bot_token=settings.TELEGRAM_BOT_TOKEN
)
vk_validation = VKValidation(
	client_secret=settings.VK_CLIENT_SECRET
)
max_validation = MaxValidation(
	bot_token=getattr(settings, "MAX_BOT_TOKEN", "") or ""
)
user_service = UserService()
jwt_service = JWTService(
	secret=getattr(settings, "JWT_SECRET"),
	token_life_in_seconds=settings.JWT_DURATION
)

yookasa_client = YookasaClient(
	shop_id=getattr(settings, "YOOKASSA_SHOP_ID"),
	secret_key=getattr(settings, "YOOKASSA_SECRET_KEY")
)

yookasa_secret_path = settings.YOOKASSA_SECRET_PATH

class JWTAuthorization(HttpBearer):
	def authenticate(self, request: HttpRequest, token: str) -> Optional[Any]:
		if jwt_service.is_valid(token):
			return token
		return None


@api.get(
	"/public/vk-qr/{token}",
	response={200: VkQrResolveSchema, 404: MessageResponse},
	tags=["Public"],
)
def resolve_vk_qr_by_token(request, token: str):
	"""Разбор статичного фрагмента из QR `vk.com/app…#token` (HMAC от uuid тренажёра и id зала)."""
	row = lookup_vk_qr_trainer_gym(token)
	if row is None:
		return 404, MessageResponse(message=UM.VK_QR_UNKNOWN)
	trainer_uuid, gym_id = row
	return VkQrResolveSchema(trainer_uuid=trainer_uuid, gym_id=gym_id)


@api.post("/token/vk", response={200: TokenResponse, 400: MessageResponse}, tags=["Authorization"])
def get_token_by_vk(request, launch_params: str):
	vk_user = vk_validation.validate(launch_params)
	if vk_user is None:
		return 400, MessageResponse(message=UM.VK_INIT_INVALID)
	user = user_service.save_if_not_exist_vk(vk_user)
	return 200, TokenResponse(token=jwt_service.issue(payload={"user_id": user.id}))


@api.get(
	"/public/max-qr/{token}",
	response={200: MaxQrResolveSchema, 404: MessageResponse},
	tags=["Public"],
)
def resolve_max_qr_by_token(request, token: str):
	"""Разбор статичного токена из QR `max.ru/{bot}?startapp={token}` (HMAC от uuid тренажёра и id зала)."""
	row = lookup_max_qr_trainer_gym(token)
	if row is None:
		return 404, MessageResponse(message=UM.MAX_QR_UNKNOWN)
	trainer_uuid, gym_id = row
	return MaxQrResolveSchema(trainer_uuid=trainer_uuid, gym_id=gym_id)


@api.post("/token/max", response={200: TokenResponse, 400: MessageResponse}, tags=["Authorization"])
def get_token_by_max(request, init_data: str):
	max_user = max_validation.validate(init_data)
	if max_user is None:
		return 400, MessageResponse(message=UM.MAX_INIT_INVALID)
	user = user_service.save_if_not_exist_max(max_user)
	return 200, TokenResponse(token=jwt_service.issue(payload={"user_id": user.id}))


@api.patch(
	"/user/max-profile",
	response={200: MessageResponse, 401: MessageResponse, 403: MessageResponse},
	tags=["Authorization"],
	auth=JWTAuthorization(),
)
def sync_max_profile(request, payload: MaxProfileSyncSchema):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	try:
		user_service.apply_max_bridge_profile(
			user,
			first_name=payload.first_name,
			last_name=payload.last_name,
			profile_photo=payload.profile_photo,
		)
	except ValueError:
		return 403, MessageResponse(message=UM.FORBIDDEN)
	return 200, MessageResponse(message=UM.MAX_PROFILE_SYNCED)


@api.post("/token/telegram", response={200: TokenResponse, 400: MessageResponse}, tags=["Authorization"])
def get_token_by_telegram(request, init_data: str):
	telegram_user = tg_app_data_validation.validate_init_data(init_data=init_data)
	if telegram_user is not None:
		user = user_service.save_if_not_exist(user=telegram_user)
		return 200, TokenResponse(token=jwt_service.issue(payload={"user_id": user.id}))
	return 400, MessageResponse(message=UM.TELEGRAM_INIT_INVALID)


@api.post("/auth/register", response={200: TokenResponse, 400: MessageResponse}, tags=["Auth PWA"])
def register(request, payload: RegisterSchema):
	try:
		user = user_service.register(
			email=payload.email,
			password=payload.password,
			first_name=payload.first_name or "",
			last_name=payload.last_name or "",
		)
		return 200, TokenResponse(token=jwt_service.issue(payload={"user_id": user.id}))
	except ValueError as e:
		logger.info("Registration rejected: %s", e)
		return 400, MessageResponse(message=UM.REGISTER_EMAIL_EXISTS)


@api.post("/auth/login", response={200: TokenResponse, 401: MessageResponse}, tags=["Auth PWA"])
def login(request, payload: LoginSchema):
	user = user_service.login_by_email(email=payload.email, password=payload.password)
	if user is None:
		return 401, MessageResponse(message=UM.LOGIN_INVALID)
	return 200, TokenResponse(token=jwt_service.issue(payload={"user_id": user.id}))


@api.get("/auth/me", response={200: MeSchema, 401: MessageResponse}, tags=["Auth PWA"], auth=JWTAuthorization())
def me(request):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	return 200, MeSchema(
		id=user.id,
		username=user.username,
		email=user.email or "",
		first_name=user.first_name,
		last_name=user.last_name,
		profile_photo=user.profile_photo,
		is_onboarding_complete=user.is_onboarding_complete,
	)


@api.post(
	"/onboarding/complete",
	response={200: MessageResponse, 401: MessageResponse},
	tags=["Onboarding"],
	auth=JWTAuthorization(),
)
def complete_onboarding(request):
	"""Сохранить в БД, что пользователь завершил вводный тур (`is_onboarding_complete=True`)."""
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	user.is_onboarding_complete = True
	user.save(update_fields=["is_onboarding_complete"])
	return 200, MessageResponse(message=UM.ONBOARDING_SAVED)


@api.post(
	"/onboarding/reset",
	response={200: MessageResponse, 401: MessageResponse},
	tags=["Onboarding"],
	auth=JWTAuthorization(),
)
def reset_onboarding(request):
	"""Сбросить флаг в БД — снова показывать онбординг, пока пользователь не пройдёт его."""
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	user.is_onboarding_complete = False
	user.save(update_fields=["is_onboarding_complete"])
	return 200, MessageResponse(message=UM.ONBOARDING_RESET)


@api.get(
	"/user",
	tags=["Onboarding"],
	response={200: UserSchema, 401: MessageResponse},
	auth=JWTAuthorization(),
)
def get_user(request):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	return 200, UserSchema(
		id=user.id,
		username=user.username,
		email=user.email or "",
		photo=build_absolute_uri(request, user.profile_photo),
		last_name=user.last_name,
		first_name=user.first_name,
		is_onboarding_complete=user.is_onboarding_complete,
	)


@api.patch(
	"/user/vk-profile",
	response={200: MessageResponse, 401: MessageResponse, 403: MessageResponse},
	tags=["User"],
	auth=JWTAuthorization(),
)
def sync_vk_profile(request, payload: VkProfileSyncSchema):
	"""Имя, фамилия и фото из VK Bridge (VKWebAppGetUserInfo) для мини-приложения."""
	user_id = jwt_service.body(token=request.auth).get("user_id")
	user = TelegramUser.objects.filter(id=user_id).first()
	if user is None:
		return 401, MessageResponse(message=UM.USER_PROFILE_MISSING)
	if user.vk_id is None:
		return 403, MessageResponse(message=UM.FORBIDDEN)
	try:
		user_service.apply_vk_bridge_profile(
			user,
			first_name=payload.first_name,
			last_name=payload.last_name,
			profile_photo=payload.profile_photo,
		)
	except ValueError:
		return 403, MessageResponse(message=UM.FORBIDDEN)
	return 200, MessageResponse(message=UM.VK_PROFILE_SYNCED)


@api.get("/events/types", response=List[EventTypeSchema], tags=["Events"], auth=JWTAuthorization())
def list_event_types(request):
	return EventTypeModel.objects.all()


@api.post("/events/logs", response=EventLogSchema, tags=["Events"], auth=JWTAuthorization())
def create_event_log(request, payload: EventLogCreateSchema):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	return EventLogModel.objects.create(
		user_id=user_id,
		event_type_id=payload.event_type_id
	)


@api.get("/trainers", response=List[TrainerSchema], tags=["Trainers"], auth=JWTAuthorization())
def list_trainers(request, instruction_type: Optional[ExerciseInstructionType] = None):
	trainers = TrainerModel.objects.all()
	result = []
	for trainer in trainers:
		exercise_relations = TrainerExerciseRelation.objects.filter(trainer=trainer.id, show=True).all()
		exercises = [rel.exercise for rel in exercise_relations]
		muscles = set()
		for exercise in exercises:
			for m in exercise.muscles:
				muscles.add(m)
		result.append(TrainerSchema(
			id=trainer.id,
			uuid=str(trainer.uuid),
			name=trainer.name,
			photo=build_absolute_uri(request, trainer.photo),
			description=trainer.description,
			muscles=list(muscles),
			exercises=[],
		))
	return result


# Без auth: по QR с телефона открывают до логина — карточка тренажёра должна быть публичной
@api.get("/trainers/{trainer_uuid}", response={200: TrainerSchema, 404: MessageResponse}, tags=["Trainers"])
def get_trainer(request, trainer_uuid: str, instruction_type: Optional[ExerciseInstructionType] = None):
	trainer = TrainerModel.objects.filter(uuid=trainer_uuid).first()
	if not trainer:
		return 404, MessageResponse(message=UM.TRAINER_NOT_FOUND)

	exercise_relations = TrainerExerciseRelation.objects.filter(trainer=trainer.id, show=True).all()
	exercises = [relation.exercise for relation in exercise_relations]
	exercise_ids = set([exercise.id for exercise in exercises])

	if instruction_type is not None:
		exercise_instructions = ExerciseInstructionModel.objects.filter(exercise__in=exercise_ids, type=instruction_type).all()
		exercises = [ei.exercise for ei in exercise_instructions]

	exercise_ids = set([exercise.id for exercise in exercises])

	for item in ExerciseInstructionModel.objects.filter(type=ExerciseInstructionType.ALL).select_related('exercise').all():
		if item.exercise.id not in exercise_ids:
			exercises.append(item.exercise)

	exercises.sort(key=lambda x: x.access_type == ExerciseAccessType.PAID)

	muscles = set()
	for exercise in exercises:
		for exercise_muscle in exercise.muscles:
			muscles.add(exercise_muscle)

	return TrainerSchema(
		id=trainer.id,
		uuid=str(trainer.uuid),
		name=trainer.name,
		photo=build_absolute_uri(request, trainer.photo),
		description=trainer.description,
		muscles=list(muscles),
		exercises=[ExerciseCardSchema(
			id=exercise.id,
			name=exercise.name,
			cover=build_absolute_uri(request, exercise.cover),
			description=exercise.description,
			access_type=exercise.access_type
		) for exercise in exercises]
	)


@api.get("/exercises/{exercise_id}", response={200: ExerciseSchema, 400: MessageResponse, 402: MessageResponse, 404: MessageResponse}, tags=["Exercises"], auth=JWTAuthorization())
def get_exercise(request, exercise_id: int, instruction_type: ExerciseInstructionType):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	exercise = ExerciseModel.objects.filter(id=exercise_id).first()
	if exercise is not None:
		if ExerciseAccessService.is_user_has_access(user_id=user_id, exercise_id=exercise_id):
			try:
				instruction = ExerciseInstructionModel.objects.filter(exercise=exercise_id, type=instruction_type).first()
				if instruction is None:
					instruction = ExerciseInstructionModel.objects.filter(exercise=exercise_id, type=ExerciseInstructionType.ALL).first()

				if instruction is not None:
					return ExerciseSchema(
						id=exercise.id,
						name=exercise.name,
						description=instruction.description,
						access_type=exercise.access_type,
						muscles=exercise.muscles,
						instruction_type=instruction_type,
						instruction=instruction.instruction["blocks"],
						video_url=instruction.video_url,
						cover=build_absolute_uri(request, exercise.cover)
					)
				else:
					return 400, MessageResponse(message=UM.NO_INSTRUCTION_TAB)
			except ExerciseInstructionModel.DoesNotExist as e:
				traceback.print_exception(e)
		else:
			return 402, MessageResponse(message=UM.CONTENT_PAYWALL)
	return 404, MessageResponse(message=UM.EXERCISE_NOT_FOUND)


@api.get("/invoices/types", response=List[InvoiceTypeSchema], tags=["Invoices"], auth=JWTAuthorization())
def list_invoice_types(request):
	invoice_types = SubscriptionTypeModel.objects.all()
	result = []
	for it in invoice_types:
		item = {
			"id": it.id,
			"name": it.name,
			"description": it.description,
			"price": float(it.price),
			"scop_type": it.scope_type,
			"exercises": []
		}
		if it.scope_type in [SubscriptionScopeType.SELECT, SubscriptionScopeType.ONE]:
			scopes = SubscriptionTypeScopeModel.objects.filter(type=it)
			item["exercises"] = [
				{"id": s.exercise.id, "name": s.exercise.name if s.exercise else None}
				for s in scopes
			]
		result.append(item)
	return result


@api.get("/invoices", response={200: List[UserInvoice]}, tags=["Invoices"], auth=JWTAuthorization())
def get_user_invoices(request):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	return list(InvoiceModel.objects.filter(user_id=user_id).all())

@api.post("/subscriptions", response={200: InvoiceSchema, 400: MessageResponse}, tags=["Subscription"], auth=JWTAuthorization())
def subscribe(request, payload: InvoiceCreateSchema):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	subscription_type = SubscriptionTypeModel.objects.filter(id=payload.subscription_type_id).first()
	if subscription_type is None:
		return 400, MessageResponse(message=UM.SUBSCRIPTION_PLAN_MISSING)
	description = f"Оплата подписки {subscription_type}"
	idempotence_key = str(uuid.uuid4())  # TODO Move to normal lib
	
	with transaction.atomic():
		invoice = InvoiceModel.objects.create(
			user_id=user_id,
			type=subscription_type,
			description=description,
			status=InvoiceStatus.PENDING,
			idempotence_key=idempotence_key,
			confirmation_url=None
		)
		
		try:
			subscription = SubscriptionModel.objects.filter(user=user_id, type=subscription_type).first()
			if subscription is None:
				subscription = SubscriptionModel.objects.create(
					type=invoice.type,
					user=invoice.user,
					is_enabled=True
				)
			else:
				# Подписка для типа создаётся до оплаты; без успешного счёта get_latest_valid_invoice() = None — иначе нельзя повторить год после сорванной оплаты.
				if subscription.get_latest_valid_invoice() is not None:
					transaction.set_rollback(True)
					return 400, MessageResponse(message=UM.SUBSCRIPTION_ALREADY_ACTIVE)
			SubscriptionInvoiceModel.objects.create(
				subscription=subscription,
				invoice=invoice
			)
		except Exception as e:
			traceback.print_exception(e)
			logger.error(f"Error on create subscription: {e}")
			transaction.set_rollback(True)
	
		payment = yookasa_client.make_invoice(
			amount=float(subscription_type.price),
			invoice_id=invoice.id,
			description=description,
			return_url=payload.return_url,
			idempotence_key=idempotence_key,
			payment_method=payload.payment_method
		)

		if payment:
			invoice.confirmation_url = payment['confirmation']['confirmation_url']
			invoice.save()
			return 200, InvoiceSchema(
				id=invoice.id,
				user_id=invoice.user.id,
				type_id=invoice.type.id,
				status=invoice.status,
				description=invoice.description,
				confirmation_url=invoice.confirmation_url,
				created_at=invoice.created_at
			)
		else:
			transaction.set_rollback(True)
		
	return 400, MessageResponse(message=UM.SUBSCRIPTION_PAYMENT_UNAVAILABLE)


@api.get("/subscriptions", tags=["Subscription"], auth=JWTAuthorization(), response=Optional[SubscriptionSchema])
def get_user_subscription(request):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	return SubscriptionModel.objects.filter(user=user_id, is_enabled=True).first()

@api.delete("/subscriptions/{subscription_id}", tags=["Subscription"], auth=JWTAuthorization(), response={200: MessageResponse, 404: MessageResponse, 403: MessageResponse})
def delete_subscription(request, subscription_id: int):
	user_id = jwt_service.body(token=request.auth).get("user_id")
	subscription = get_object_or_404(SubscriptionModel, id=subscription_id)
	
	if subscription.user.id != user_id:
		return 403, MessageResponse(message=UM.FORBIDDEN)
		
	subscription.canceled_at = now()
	subscription.save()
	return 200, MessageResponse(message=UM.SUBSCRIPTION_REMOVED)


@api.post(f"/yookasa/log{yookasa_secret_path}", tags=["Invoices"])
def yookasa_webhook(request):
	import json
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return 400, MessageResponse(message=UM.BAD_JSON)

	event = data.get("event")
	payment_data = data.get("object", {})
	metadata = payment_data.get("metadata", {})
	invoice_id = metadata.get("invoice_id")

	if not invoice_id:
		return 200, MessageResponse(message=UM.WEBHOOK_SKIP_NO_METADATA)

	invoice = InvoiceModel.objects.filter(id=invoice_id).first()
	if not invoice:
		return 200, MessageResponse(message=UM.WEBHOOK_SKIP_UNKNOWN_INVOICE)

	YooKasaWebhookLogModel.objects.create(
		invoice=invoice,
		body=data
	)

	if event == "payment.succeeded":
		payment_method = payment_data.get("payment_method", {})
		invoice.status = InvoiceStatus.SUCCEEDED
		invoice.updated_at = now()
		invoice.save()
		if payment_method:
			UserPaymentMethodModel.objects.get_or_create(
				id=payment_method["id"],
				defaults={
					"user": invoice.user,
					"title": payment_method["title"],
					"type": payment_method["type"],
					"card_info": payment_method["card"]
				}
			)
		else:
			logger.error(f"User payment not saved. payment_method is empty ({payment_method}). Invoice id: {invoice.id}")
		subscription_invoice = SubscriptionInvoiceModel.objects.filter(invoice=invoice).first()
		if subscription_invoice is not None:
			if not subscription_invoice.subscription.is_enabled:
				subscription_invoice.subscription.is_enabled = True
				subscription_invoice.subscription.canceled_at = None
			subscription_invoice.subscription.save()
	elif event == "payment.canceled":
		invoice.status = InvoiceStatus.CANCELED
		invoice.updated_at = now()
		invoice.save()
	elif event == "payment.waiting_for_capture":
		invoice.status = InvoiceStatus.WAITING_FOR_CAPTURE
		invoice.updated_at = now()
		invoice.save()

	return 200, MessageResponse(message=UM.WEBHOOK_OK)
