from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RetailStockist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('city', models.CharField(blank=True, default='', max_length=120)),
                ('url', models.CharField(blank=True, default='', max_length=500)),
                ('address', models.CharField(blank=True, default='', max_length=400)),
                ('phone', models.CharField(blank=True, default='', max_length=60)),
                ('email', models.CharField(blank=True, default='', max_length=200)),
                ('hours', models.CharField(blank=True, default='', max_length=200)),
                ('closed', models.CharField(blank=True, default='', max_length=200)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Retail Stockist',
                'verbose_name_plural': 'Retail Stockists',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
