# This is a Mako template file used by Alembic, a database migration tool for SQLAlchemy.
# The template generates migration scripts that define how to upgrade or downgrade the database schema.

"""
${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
# Import necessary types for type hinting.
from typing import Sequence, Union

# Import Alembic's operations module, which provides functions to define schema changes.
from alembic import op
# Import SQLAlchemy, which is used to define and manipulate database schema elements.
import sqlalchemy as sa
# Optionally include any additional imports required for the migration.
${imports if imports else ""}

# These are special variables that Alembic uses to track the migration's identity and dependencies.
revision: str = ${repr(up_revision)}  # Unique identifier for this migration.
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}  # The previous migration(s) this one depends on.
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}  # Optional labels for branching migration histories.
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}  # Other migrations this one depends on.

# The upgrade function defines the operations to apply when upgrading the database schema to this revision.
def upgrade() -> None:
    """Upgrade schema."""
    # The ${upgrades} variable is replaced by Alembic with the actual upgrade operations.
    ${upgrades if upgrades else "pass"}

# The downgrade function defines the operations to apply when downgrading the database schema to the previous revision.
def downgrade() -> None:
    """Downgrade schema."""
    # The ${downgrades} variable is replaced by Alembic with the actual downgrade operations.
    ${downgrades if downgrades else "pass"}
