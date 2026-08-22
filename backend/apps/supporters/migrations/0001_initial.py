from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Supporter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('logo_url', models.CharField(blank=True, default='', max_length=500)),
                ('logo_alt', models.CharField(blank=True, default='', max_length=300)),
                ('href', models.CharField(blank=True, default='', max_length=500)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Supporter',
                'verbose_name_plural': 'Supporters',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
