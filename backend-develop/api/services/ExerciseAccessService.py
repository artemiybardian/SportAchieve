import datetime
import time

from api.models.ExerciseAccessType import ExerciseAccessType
from api.models.InvoiceModel import InvoiceModel
from api.models.InvoiceStatus import InvoiceStatus
from api.models.SubscriptionScopeType import SubscriptionScopeType
from api.models.ExerciseModel import ExerciseModel
from api.models.SubscriptionTypeScopeModel import SubscriptionTypeScopeModel
from api.models.SubscriptionTypeModel import SubscriptionTypeModel


class ExerciseAccessService:
    
    @staticmethod
    def get_paid_exercises(user_id: int):
        available_exercises = []
        invoices = InvoiceModel.objects.filter(
            user_id=user_id,
            status=InvoiceStatus.SUCCEEDED
        ).all()
        
        available_invoice_type_ids = []
        
        for invoice in invoices:
            invoice_type: SubscriptionTypeModel = invoice.type
            access_before_ts = int(invoice.updated_at.timestamp()) + (invoice_type.access_duration_in_days * 24 * 60 * 60)
            now_ts = int(time.time())
            if access_before_ts >= now_ts:
                if invoice_type.scope_type == SubscriptionScopeType.ALL:
                    return ExerciseModel.objects.all()
                else:
                    available_invoice_type_ids.append(invoice_type.id)
            
        for invoice_scope in SubscriptionTypeScopeModel.objects.filter(type__in=available_invoice_type_ids):
            available_exercises.append(invoice_scope.exercise)
        return available_exercises
    
    @staticmethod
    def is_user_has_access(user_id: int, exercise_id: int):
        paid_exercises = ExerciseAccessService.get_paid_exercises(user_id)
        for paid_exercise in paid_exercises:
            if paid_exercise.id == exercise_id:
                return True
        for exercise in ExerciseModel.objects.filter(access_type=ExerciseAccessType.FREE).all():
            if exercise.id == exercise_id:
                return True
        return False
