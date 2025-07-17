"""Add color field to Category model

Revision ID: add_color_to_category
Revises: 15753c91c0b0
Create Date: 2025-07-15 00:15:00.000000

"""
from alembic import op #type: ignore
import sqlalchemy as sa 


# revision identifiers, used by Alembic.
revision = 'add_color_to_category'
down_revision = '15753c91c0b0'
branch_labels = None
depends_on = None


def upgrade():
    # Add color column to category table
    op.add_column('category', sa.Column('color', sa.String(7), nullable=True, server_default='#FF5733'))


def downgrade():
    # Remove color column from category table
    op.drop_column('category', 'color') 