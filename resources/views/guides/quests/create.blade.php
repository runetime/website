@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('guides.quests.create.title')
    </h1>
    <p class='text-info'>
        @lang('guides.create_note')
    </p>
    <form action='' method='post' class='form-horizontal' role='form'>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='name'>
                @lang('guides.quests.create.name')
            </label>
            <div class='col-lg-10'>
                <input id='name' class='form-control' type='text' name='name' required />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='difficulty'>
                @lang('guides.quests.create.difficulty')
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='difficulty' value='1' checked />
                        @lang('guides.quests.difficulty.novice')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='difficulty' value='2' />
                        @lang('guides.quests.difficulty.intermediate')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='difficulty' value='3' />
                        @lang('guides.quests.difficulty.experienced')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='difficulty' value='4' />
                        @lang('guides.quests.difficulty.master')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='difficulty' value='5' />
                        @lang('guides.quests.difficulty.grandmaster')
                    </label>
                </div>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='length'>
                Length
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='length' value='6' checked />
                        @lang('guides.quests.length.short')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='length' value='7' />
                        @lang('guides.quests.length.medium')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='length' value='8' />
                        @lang('guides.quests.length.long')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='length' value='9' />
                        @lang('guides.quests.length.very_long')
                    </label>
                </div>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='membership'>
                @lang('guides.quests.view.membership')
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='membership' value='10' checked />
                        @lang('utilities.membership.free')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='membership' value='11' />
                        @lang('utilities.membership.members')
                    </label>
                </div>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='qp'>
                @lang('guides.quests.view.quest_points')
            </label>
            <div class='col-lg-10'>
                <input id='qp' class='form-control' type='text' name='qp' required />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='completed'>
                @lang('guides.quests.view.completed')
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='completed' value='1' checked />
                        @lang('utilities.yes')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='completed' value='0' />
                        @lang('utilities.no')
                    </label>
                </div>
                <p class='help-block'>
                    @lang('guides.quests.create.completed_note')
                </p>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='description'>
                @lang('guides.quests.view.description')
            </label>
            <div class='col-lg-10'>
                <textarea name='description' id='description' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='quest_requirements'>
                @lang('guides.quests.view.quest_requirements')
            </label>
            <div class='col-lg-10'>
                <textarea name='quest_requirements' id='quest_requirements' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='skill_requirements'>
                @lang('guides.quests.view.skill_requirements')
            </label>
            <div class='col-lg-10'>
                <textarea name='skill_requirements' id='skill_requirements' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='items_required'>
                @lang('guides.quests.view.items_required')
            </label>
            <div class='col-lg-10'>
                <textarea name='items_required' id='items_required' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='items_recommended'>
                @lang('guides.quests.view.items_recommended')
            </label>
            <div class='col-lg-10'>
                <textarea name='items_recommended' id='items_recommended' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='reward'>
                @lang('guides.quests.view.reward')
            </label>
            <div class='col-lg-10'>
                <textarea name='reward' id='reward' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='starting_point'>
                @lang('guides.quests.view.starting_point')
            </label>
            <div class='col-lg-10'>
                <textarea name='starting_point' id='starting_point' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='contents'>
                @lang('guides.quests.view.guide')
            </label>
            <div class='col-lg-10'>
                <textarea name='contents' id='contents' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <div class='col-lg-offset-2 col-lg-10'>
                <button class='btn btn-primary' type='submit'>
                    @lang('guides.quests.create.submit')
                </button>
            </div>
        </div>
    </form>
</div>
@stop
