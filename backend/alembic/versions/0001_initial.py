"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-09-15

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "user_profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("sex", sa.Enum("male", "female", name="sex_enum"), nullable=True),
        sa.Column("birth_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("height_cm", sa.Float(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column(
            "activity_level",
            sa.Enum("sedentary", "light", "moderate", "active", "very_active", name="activity_level_enum"),
            nullable=True,
        ),
        sa.Column("goal", sa.Enum("lose_weight", "maintain", "gain_weight", name="goal_enum"), nullable=True),
        sa.Column("target_calories_override", sa.Float(), nullable=True),
        sa.Column("target_protein_g_override", sa.Float(), nullable=True),
        sa.Column("target_fat_g_override", sa.Float(), nullable=True),
        sa.Column("target_carbs_g_override", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "food_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("source", sa.Enum("seed", "ai_estimate", "user", name="food_source_enum"), nullable=False),
        sa.Column("calories_per_100g", sa.Float(), nullable=False),
        sa.Column("protein_per_100g", sa.Float(), nullable=False),
        sa.Column("fat_per_100g", sa.Float(), nullable=False),
        sa.Column("carbs_per_100g", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_food_items_name", "food_items", ["name"])

    op.create_table(
        "meal_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "food_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("meal_type", sa.Enum("breakfast", "lunch", "dinner", "snack", name="meal_type_enum"), nullable=False),
        sa.Column("source", sa.Enum("manual", "photo_ai", name="entry_source_enum"), nullable=False),
        sa.Column("grams", sa.Float(), nullable=False),
        sa.Column("calories", sa.Float(), nullable=False),
        sa.Column("protein_g", sa.Float(), nullable=False),
        sa.Column("fat_g", sa.Float(), nullable=False),
        sa.Column("carbs_g", sa.Float(), nullable=False),
        sa.Column("photo_url", sa.String(512), nullable=True),
        sa.Column("logged_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_meal_entries_user_id", "meal_entries", ["user_id"])

    op.create_table(
        "recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("period_days", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_recommendations_user_id", "recommendations", ["user_id"])


def downgrade() -> None:
    op.drop_table("recommendations")
    op.drop_table("meal_entries")
    op.drop_table("food_items")
    op.drop_table("user_profiles")
    op.drop_table("users")
    sa.Enum(name="entry_source_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="meal_type_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="food_source_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="goal_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="activity_level_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="sex_enum").drop(op.get_bind(), checkfirst=True)
