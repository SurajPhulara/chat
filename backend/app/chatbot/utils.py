import json
from typing import List, Dict, Optional
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()

# Define the desired data structure with the 'all_parameters_collected' flag
class UserInputResponse(BaseModel):
    parameters: Dict[str, Optional[str]] = Field(
        default_factory=lambda: {
            "No of shareholders": None,
            "No of visas": None,
            "Activities": None,
            "Cost": None,
            "Office space": None,
        },
        description=(
            "Parameters collected from the user for freezone suggestions. "
            "All fields are optional until the user provides them."
        )
    )
    response: str = Field(
        ..., 
        description="The chatbot's response to the user."
    )
    all_parameters_collected: bool = Field(
        default=False, 
        description="Flag indicating if all parameters have been collected from the user."
    )


# Function to give suggestions based on the collected parameters
def give_suggestion(
    parameters: Dict[str, str], user_query: str, chat_history: List[Dict[str, str]]
) -> str:
    """
    Gives a suggestion based on the collected parameters. For now, returns a hardcoded response.

    Args:
        parameters (dict): Collected parameters from the user.
        user_query (str): The user's original query.
        chat_history (list): The chat history.

    Returns:
        str: A hardcoded suggestion for demonstration.
    """
    # Hardcoded response for demonstration
    return (
        f"Thank you for providing all the details. Based on your input:\n"
        f"- Number of shareholders: {parameters.get('No of shareholders')}\n"
        f"- Number of visas: {parameters.get('No of visas')}\n"
        f"- Activities: {parameters.get('Activities')}\n"
        f"- Cost: {parameters.get('Cost')}\n"
        f"- Office space: {parameters.get('Office space')}\n\n"
        "I suggest the following freezones: Freezone A, Freezone B, Freezone C."
    )


# Function to process user input
def process_user_input(user_query: str, chat_history: List[Dict[str, str]]) -> Dict:
    """
    Process user input and return a structured JSON response using LangChain.
    """
    # Initialize the model
    model = ChatOpenAI(temperature=0, model="gpt-4o-mini")

    # Define the output parser
    parser = JsonOutputParser(pydantic_object=UserInputResponse)

    # Build the prompt template
    prompt = PromptTemplate(
        template=(
            "You are a helpful assistant. Process the user's query and respond in JSON format "
            "using the following structure:\n"
            "{format_instructions}\n\n"
            
            "You are a helpful assistant. Your task is to guide the user through a series of "
            "questions to collect details about their freezone requirements and eventually suggest the best freezones. "
            "You will process the user's query and respond with a JSON structure containing the response and status of "
            "collected parameters.\n\n"

            "Instructions:\n"
            "1. If the query is general, respond directly and move on to the next step.\n"
            "2. If the query relates to freezones, check the user's provided information in the chat history. "
            "The parameters you need to collect are: 'No of shareholders', 'No of visas', 'Activities', 'Cost', "
            "and 'Office space'. These parameters are optional initially.\n"
            "3. If any of the parameters are missing, ask the user for one missing parameter at a time in a conversational "
            "manner.\n"
            "4. Only when **all** parameters ('No of shareholders', 'No of visas', 'Activities', 'Cost', and 'Office space') "
            "are provided should you set the flag `all_parameters_collected` to `True`.\n"
            "5. If all parameters are collected, suggest appropriate freezones based on the user's input. The assistant should "
            "suggest the best freezones by referencing the parameters the user provided.\n"
            "6. After suggesting the freezones, reset the parameter collection status to `False` so that the assistant can be ready "
            "to collect new parameters from the next user request.\n"
            "7. If any parameters are missing, the assistant should respond with which specific parameter is still needed. "
            "Repeat this until all parameters are collected.\n"
            
            "\nChat history:\n{chat_history}\n\n"
            "User query:\n{query}\n\n"
            "Your task is to:\n"
            "1. If all required parameters are collected, set `all_parameters_collected` to `True`, suggest freezones, and then reset."
            "2. If parameters are missing, prompt the user for the missing ones one at a time."
            "3. Return the structured response in JSON format with the appropriate information."
        ),
        input_variables=["query", "chat_history"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    # Create a chain by combining the prompt, model, and parser
    chain = prompt | model | parser

    # Invoke the chain with the user query and chat history
    result = chain.invoke({"query": user_query, "chat_history": str(chat_history)})
    # print(result)
    if result["all_parameters_collected"]:
        # Call the suggestion giver function if the flag is True
        suggestion = give_suggestion(
            parameters=result["parameters"], 
            user_query=user_query, 
            chat_history=chat_history
        )
        print(f"\nAssistant Suggestion: {suggestion}")
        return suggestion
    return result['response']