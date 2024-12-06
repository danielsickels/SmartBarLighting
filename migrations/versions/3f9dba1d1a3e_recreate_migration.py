"""Recreate migration

Revision ID: 3f9dba1d1a3e
Revises: 
Create Date: 2024-12-06 00:20:16.110663

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f9dba1d1a3e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the new column in a batch operation to handle SQLite constraints
    with op.batch_alter_table('bottles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('spirit_type_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_bottles_spirit_types', 'spirit_types', ['spirit_type_id'], ['id']
        )

    # Populate data from the old spirit_type column
    op.execute("""
        UPDATE bottles
        SET spirit_type_id = (
            SELECT id FROM spirit_types WHERE name = bottles.spirit_type
        )
        WHERE spirit_type IS NOT NULL;
    """)

    # Make the column non-nullable after populating data
    with op.batch_alter_table('bottles', schema=None) as batch_op:
        batch_op.alter_column('spirit_type_id', nullable=False)


def downgrade() -> None:
    # Reverse the batch operation
    with op.batch_alter_table('bottles', schema=None) as batch_op:
        batch_op.drop_constraint('fk_bottles_spirit_types', type_='foreignkey')
        batch_op.drop_column('spirit_type_id')
