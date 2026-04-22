from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_rating_value_alter_rating_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rating',
            name='value',
            field=models.FloatField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(10),
                ]
            ),
        ),
    ]
