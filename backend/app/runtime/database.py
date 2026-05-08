from sqlalchemy import create_engine
from sqlalchemy import text

from app.utils.logger import logger

DATABASE_URL = "sqlite:///generated.db"

engine = create_engine(DATABASE_URL)


def generate_database(db_schema: dict):

    with engine.connect() as conn:

        for db_type_name, db_type in db_schema.items():

            # skip invalid structures
            if not isinstance(db_type, dict):

                logger.warning(
                    f"Skipping invalid DB provider: {db_type_name}"
                )

                continue

            for table_name, fields in db_type.items():

                # skip malformed tables
                if not isinstance(fields, dict):

                    logger.warning(
                        f"Skipping malformed table: {table_name}"
                    )

                    continue

                columns = []

                for field_name, field_type in fields.items():

                    sql_type = "TEXT"

                    columns.append(
                        f"{field_name} {sql_type}"
                    )

                if not columns:

                    logger.warning(
                        f"Skipping empty table: {table_name}"
                    )

                    continue

                query = f"""
                CREATE TABLE IF NOT EXISTS {table_name}
                ({', '.join(columns)})
                """

                logger.info(
                    f"Creating table: {table_name}"
                )

                conn.execute(text(query))
                conn.commit()